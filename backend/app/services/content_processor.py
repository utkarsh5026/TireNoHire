from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    UnstructuredHTMLLoader,
    TextLoader,
    BSHTMLLoader,
    UnstructuredURLLoader,
)
from langchain.document_loaders.base import BaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import hashlib
import tempfile
import os
import requests
from fastapi import UploadFile, HTTPException
from loguru import logger
from pydantic import BaseModel
from app.core.config import settings
from app.manager import cache_manager


class DocumentChunk(BaseModel):
    """📄 Represents a processed document chunk with metadata

    Contains the extracted text content from documents along with processing information
    and a unique content hash for identification and caching purposes.
    """
    class Metadata(BaseModel):
        """📊 Document processing statistics and metrics

        Tracks the number of pages in the original document and how many
        chunks it was split into during processing.
        """
        page_count: int
        chunk_count: int

    content_hash: str
    raw_text: str
    file_name: str
    metadata: Metadata


class ContentProcessor:
    """🔄 Processes various content types into structured document chunks

    Handles different file formats (PDF, DOCX, HTML, etc.) and content sources
    (files, URLs, raw text) and converts them into standardized document chunks
    for further processing by language models.
    """

    def __init__(self):
        """🏗️ Initialize the content processor with text splitting configuration

        Sets up the text splitter with appropriate chunk size and overlap settings
        for optimal processing of documents into manageable pieces.
        """
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=4000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    @classmethod
    def _write_to_temp_file(cls, content: bytes, suffix: str) -> str:
        """💾 Helper to write content bytes to a temporary file

            Creates a temporary file with the specified suffix and writes the
            provided content to it, returning the file path for further processing.
        """
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        return temp_path

    @classmethod
    def _get_loader_for_file(cls, file_name: str) -> BaseLoader:
        """🔍 Determine the appropriate document loader based on file extension

        Maps file extensions to their corresponding LangChain document loaders
        to ensure proper parsing of different document formats.
        """
        if file_name.endswith(".pdf"):
            return PyPDFLoader
        elif file_name.endswith(".docx") or file_name.endswith(".doc"):
            return Docx2txtLoader
        elif file_name.lower().endswith('.txt'):
            return TextLoader
        elif file_name.endswith(".html"):
            return UnstructuredHTMLLoader
        elif file_name.endswith(".bshtml"):
            return BSHTMLLoader
        else:
            raise ValueError(f"Unsupported file format: {file_name}")

    @classmethod
    def _compute_hash(cls, content: bytes) -> str:
        """🔐 Generate a unique SHA-256 hash from content bytes

        Creates a consistent identifier for document content that can be
        used for caching and detecting duplicate documents.
        """
        return hashlib.sha256(content).hexdigest()

    async def process_file(self, file: UploadFile) -> DocumentChunk:
        """📁 Process an uploaded file into a structured document chunk

        Handles the file upload, creates a temporary local copy, extracts text
        using the appropriate loader, splits into chunks, and returns a
        standardized document representation with metadata.
        """
        logger.info(f"Processing file: {file.filename}")

        content = await file.read()
        content_hash = self._compute_hash(content)

        temp_path = self._write_to_temp_file(
            content,
            os.path.splitext(file.filename)[1]
        )

        try:
            loader = self._get_loader_for_file(file.filename)(temp_path)
            documents = loader.load()

            logger.info(f"Loaded {len(documents)} document pages/sections")

            # Split documents into chunks
            chunks = self.text_splitter.split_documents(documents)
            raw_text = "\n\n".join(chunk.page_content for chunk in chunks)

            logger.info(
                f"Document processed successfully, extracted {len(raw_text)} characters")

            metadata = DocumentChunk.Metadata(
                page_count=len(documents),
                chunk_count=len(chunks)
            )

            return DocumentChunk(
                content_hash=content_hash,
                raw_text=raw_text,
                file_name=file.filename,
                metadata=metadata
            )
        finally:
            # Ensure file cleanup happens even if an error occurs
            try:
                os.unlink(temp_path)
            except Exception as e:
                logger.warning(
                    f"Failed to delete temporary file {temp_path}: {str(e)}")

    async def process_text(self, text: str) -> DocumentChunk:
        """✏️ Convert raw text input into a structured document chunk

        Takes plain text input, splits it into appropriate chunks for processing,
        and returns a standardized document representation with metadata.
        Useful for processing text that's not from a file.
        """
        logger.info("Processing raw text input")
        content_hash = self._compute_hash(text.encode('utf-8'))

        document = [{"page_content": text, "metadata": {}}]
        chunks = self.text_splitter.split_documents(document)
        processed_text = "\n\n".join(chunk.page_content for chunk in chunks)

        return DocumentChunk(
            content_hash=content_hash,
            raw_text=processed_text,
            file_name="text_input",
            metadata=DocumentChunk.Metadata(
                page_count=1,
                chunk_count=len(chunks)
            )
        )

    async def process_url(self, url: str) -> DocumentChunk:
        """🌐 Extract and process content from a URL into a document chunk

        Fetches content from a web URL, detects the content type, processes it with
        the appropriate loader based on file type (PDF, DOCX, HTML), and returns
        a standardized document representation with metadata.
        """
        logger.info(f"Processing URL: {url}")

        try:
            # Check cache first if enabled
            if settings.CACHE_URL_CONTENT:
                cached_data = cache_manager.get_url_content(url)
                if cached_data:
                    logger.info(f"Cache hit for URL {url}")
                    content = cached_data["content"]
                    content_type = cached_data["metadata"]["content_type"]

                    # If we also cached the extracted text, use it
                    content_hash = cached_data["metadata"]["hash"]
                    extracted_key = f"extracted:{content_hash}"
                    cached_text = cache_manager.get(extracted_key)

                    if cached_text and settings.CACHE_EXTRACTED_TEXT:
                        logger.info(f"Using cached extracted text for {url}")
                        return DocumentChunk(
                            content_hash=content_hash,
                            raw_text=cached_text,
                            file_name=url,
                            metadata=DocumentChunk.Metadata(
                                page_count=cached_data["metadata"].get(
                                    "page_count", 1),
                                chunk_count=cached_data["metadata"].get(
                                    "chunk_count", 1)
                            )
                        )

            # If not cached, proceed with fetching and processing
            response = requests.head(url, allow_redirects=True, timeout=10)
            content_type = response.headers.get('Content-Type', '')

            # Fetch the actual content
            file_response = requests.get(url, timeout=30)
            file_response.raise_for_status()
            content = file_response.content

            # Cache the raw content if caching is enabled
            content_hash = cache_manager.hash_content(content)
            if settings.CACHE_URL_CONTENT:
                cache_manager.cache_url_content(
                    url,
                    content,
                    content_type,
                    settings.REDIS_TTL
                )

            # Process based on content type
            documents = []
            if 'application/pdf' in content_type:
                temp_path = self._write_to_temp_file(content, '.pdf')
                loader = PyPDFLoader(temp_path)
                documents = loader.load()
                os.unlink(temp_path)
            elif 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' in content_type:
                temp_path = self._write_to_temp_file(content, '.docx')
                loader = Docx2txtLoader(temp_path)
                documents = loader.load()
                os.unlink(temp_path)
            else:
                loader = UnstructuredURLLoader(
                    urls=[url], continue_on_failure=True)
                documents = loader.load()

            # Split documents into chunks
            chunks = self.text_splitter.split_documents(documents)
            processed_text = "\n\n".join(
                chunk.page_content for chunk in chunks)

            # Cache the extracted text if caching is enabled
            if settings.CACHE_EXTRACTED_TEXT:
                extracted_key = f"extracted:{content_hash}"
                cache_manager.set(
                    extracted_key, processed_text, settings.REDIS_TTL)

            logger.info(
                f"Document processed successfully, extracted {len(processed_text)} characters")

            metadata = DocumentChunk.Metadata(
                page_count=len(documents),
                chunk_count=len(chunks)
            )

            # Update the cache metadata with additional information
            if settings.CACHE_URL_CONTENT:
                meta_key = f"meta:{content_hash}"
                cached_meta = cache_manager.get(meta_key) or {}
                cached_meta.update({
                    "page_count": len(documents),
                    "chunk_count": len(chunks),
                    "text_length": len(processed_text)
                })
                cache_manager.set(meta_key, cached_meta, settings.REDIS_TTL)

            return DocumentChunk(
                content_hash=content_hash,
                raw_text=processed_text,
                file_name=url,
                metadata=metadata
            )

        except Exception as e:
            logger.error(f"Error processing URL {url}: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Failed to process URL: {str(e)}")

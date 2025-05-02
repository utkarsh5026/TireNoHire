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


class DocumentChunk(BaseModel):
    class Metadata(BaseModel):
        page_count: int
        chunk_count: int

    content_hash: str
    raw_text: str
    file_name: str
    metadata: Metadata


class ContentProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=4000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    @classmethod
    def _get_loader_for_file(cls, file_name: str) -> BaseLoader:
        """Get the appropriate loader based on the file extension"""
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
        """Compute SHA-256 hash of content"""
        return hashlib.sha256(content).hexdigest()

    async def process_file(self, file: UploadFile) -> DocumentChunk:
        """Process uploaded file using LangChain document loaders"""
        logger.info(f"Processing file: {file.filename}")

        content = await file.read()
        content_hash = self._compute_hash(content)

        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

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

    async def process_url(self, url: str) -> dict:
        logger.info(f"Processing URL: {url}")

        def _write_to_temp_file(content: bytes, suffix: str) -> str:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(content)
                temp_path = temp_file.name
            return temp_path

        try:
            response = requests.head(url, allow_redirects=True, timeout=10)
            content_type = response.headers.get('Content-Type', '')

            if 'application/pdf' in content_type:
                file_response = requests.get(url, timeout=30)
                file_response.raise_for_status()
                content = file_response.content
                content_hash = self._compute_hash(content)

                temp_path = _write_to_temp_file(content, '.pdf')

                loader = PyPDFLoader(temp_path)
                documents = loader.load()
                os.unlink(temp_path)

            elif 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' in content_type:
                file_response = requests.get(url, timeout=30)
                file_response.raise_for_status()
                content = file_response.content
                content_hash = self._compute_hash(content)

                temp_path = _write_to_temp_file(content, '.docx')

                loader = Docx2txtLoader(temp_path)
                documents = loader.load()
                os.unlink(temp_path)

            else:
                loader = UnstructuredURLLoader(
                    urls=[url], continue_on_failure=True)
                documents = loader.load()
                content = "\n".join(
                    doc.page_content for doc in documents).encode('utf-8')
                content_hash = self._compute_hash(content)

            # Split documents into chunks
            chunks = self.text_splitter.split_documents(documents)
            processed_text = "\n\n".join(
                chunk.page_content for chunk in chunks)

            logger.info(
                f"Document processed successfully, extracted {len(processed_text)} characters")

            metadata = DocumentChunk.Metadata(
                page_count=len(documents),
                chunk_count=len(chunks)
            )

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

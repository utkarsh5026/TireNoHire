from fastapi import UploadFile
from app.core.content_processor import ContentProcessor, DocumentChunk
from app.services.resume import ResumeExtractor, ResumeData
from app.db import ResumeDB
from loguru import logger


class ResumeEngine:
    """🚀 Resume processing and analysis engine

    Handles the end-to-end processing of resume documents, including:
    - 📄 File processing and text extraction
    - 🔍 Resume data parsing and structure extraction
    - 💾 Database storage and retrieval for caching
    - 🔄 Conversion between different formats and models

    Acts as the central coordinator between content processing,
    resume extraction, and database persistence layers.
    """

    def __init__(self):
        """🏗️ Initialize the resume engine with required components

        Sets up the content processor for handling document files and
        the resume extractor for parsing resume information.
        """
        self.content_processor = ContentProcessor()
        self.resume_extractor = ResumeExtractor()

    async def _parse_resume_data(self, text: str):
        """📝 Extract structured data from resume text

        Takes raw text content and transforms it into structured resume data
        using the resume extractor service.

        Args:
            text: Raw text content from the resume document

        Returns:
            Structured ResumeData object with parsed information
        """
        resume_data = await self.resume_extractor.parse_resume(text)
        return resume_data

    async def _find_from_db(self, content_hash: str):
        """🔍 Look up a resume in the database by content hash

        Searches for previously processed resumes to enable caching
        and avoid duplicate processing.

        Args:
            content_hash: Unique hash of the resume content

        Returns:
            Existing resume document or None if not found
        """
        existing_resume = await ResumeDB.find_one({"content_hash": content_hash})
        return existing_resume

    async def _save_resume(self, document_chunk: DocumentChunk, resume_data: ResumeData):
        """💾 Save a new resume to the database

        Creates a new resume record with both raw content and
        structured data for future retrieval.

        Args:
            document_chunk: Processed document with raw text and metadata
            resume_data: Structured resume information extracted from the document
        """
        new_resume = ResumeDB(
            content_hash=document_chunk.content_hash,
            name=document_chunk.file_name,
            type="file",
            text_content=document_chunk.raw_text,
            parsed_data=resume_data.model_dump(),
            status="ready"
        )
        await new_resume.save_document()
        logger.info(f"Created new resume {new_resume.id}")

    async def _process_document_chunk(self, document_chunk: DocumentChunk):
        """🔄 Process a document chunk into resume data

        Common processing logic for both file and URL sources:
        - 🔍 Checks for existing processed version in database
        - 🧠 Extracts structured data if needed
        - 💾 Saves or updates the database record

        Args:
            document_chunk: Processed document with raw text and metadata

        Returns:
            Structured resume data as a dictionary
        """
        existing_resume = await self._find_from_db(document_chunk.content_hash)
        if existing_resume and existing_resume.status == "ready" and existing_resume.parsed_data:
            logger.info(
                f"Cache hit: Found existing resume with hash {document_chunk.content_hash}")
            return existing_resume.parsed_data

        resume_data = await self._parse_resume_data(document_chunk.raw_text)

        if existing_resume:
            existing_resume.name = document_chunk.file_name
            existing_resume.text_content = document_chunk.raw_text
            existing_resume.parsed_data = resume_data.model_dump()
            existing_resume.status = "ready"
            await existing_resume.save_document()
            logger.info(f"Updated existing resume {existing_resume.id}")
        else:
            await self._save_resume(document_chunk, resume_data)

        return resume_data.model_dump()

    async def from_file(self, file: UploadFile):
        """📄 Process a resume from an uploaded file

        Handles the complete resume processing workflow:
        - 📥 Processes the uploaded file into text
        - Delegates to common processing logic

        Args:
            file: Uploaded resume file (PDF, DOCX, etc.)

        Returns:
            Structured resume data as a dictionary
        """
        document_chunk = await self.content_processor.process_file(file)
        return await self._process_document_chunk(document_chunk)

    async def from_url(self, url: str):
        """📄 Process a resume from a URL

        Handles the complete resume processing workflow for URLs:
        - 🔍 Processes the URL into text
        - Delegates to common processing logic

        Args:
            url: URL of the resume document

        Returns:
            Structured resume data as a dictionary
        """
        document_chunk = await self.content_processor.process_url(url)
        return await self._process_document_chunk(document_chunk)

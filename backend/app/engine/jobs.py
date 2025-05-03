from fastapi import UploadFile
from app.services.content_processor import ContentProcessor, DocumentChunk
from app.services.jobs import JobDescriptionExtractor, JobData
from app.db import JobDB
from loguru import logger


class JobEngine:
    """🚀 Job description processing and analysis engine

    Handles the end-to-end processing of job descriptions, including:
    - 📄 File processing and text extraction
    - 🔍 Job data parsing and structure extraction
    - 💾 Database storage and retrieval for caching
    - 🔄 Conversion between different formats and models

    Acts as the central coordinator between content processing,
    job description extraction, and database persistence layers.
    """

    def __init__(self):
        """🏗️ Initialize the job engine with required components

        Sets up the content processor for handling document files and
        the job extractor for parsing job information.
        """
        self.content_processor = ContentProcessor()
        self.job_extractor = JobDescriptionExtractor()

    async def _parse_job_data(self, text: str) -> JobData:
        """📝 Extract structured data from job description text

        Takes raw text content and transforms it into structured job data
        using the job extractor service.

        Args:
            text: Raw text content from the job description document

        Returns:
            Structured JobData object with parsed information
        """
        job_data = await self.job_extractor.parse_job_description(text)
        return job_data

    async def _find_from_db(self, content_hash: str):
        """🔍 Look up a job in the database by content hash

        Searches for previously processed jobs to enable caching
        and avoid duplicate processing.

        Args:
            content_hash: Unique hash of the job content

        Returns:
            Existing job document or None if not found
        """
        existing_job = await JobDB.find_one({"content_hash": content_hash})
        return existing_job

    async def _save_job(self, document_chunk: DocumentChunk, job_data: JobData):
        """💾 Save a new job to the database

        Creates a new job record with both raw content and
        structured data for future retrieval.

        Args:
            document_chunk: Processed document with raw text and metadata
            job_data: Structured job information extracted from the document
        """
        new_job = JobDB(
            content_hash=document_chunk.content_hash,
            title=job_data.title,
            description=document_chunk.raw_text,
            requirements=[req.description for req in job_data.requirements],
            responsibilities=job_data.responsibilities,
            preferred_qualifications=job_data.preferred_qualifications,
            benefits=job_data.benefits,
            source="file",
            status="ready",
            parsed_data=job_data.model_dump()
        )
        await new_job.save_document()
        logger.info(f"Created new job {new_job.id}")

    async def _process_document_chunk(self, document_chunk: DocumentChunk, source: str, source_url: str = None):
        """🔄 Process a document chunk into job data

        Common processing logic for both file and URL sources:
        - 🔍 Checks for existing processed version in database
        - 🧠 Extracts structured data if needed
        - 💾 Saves or updates the database record

        Args:
            document_chunk: Processed document with raw text and metadata
            source: Source type ("file", "text", or "link")
            source_url: URL source if applicable

        Returns:
            Structured job data as a dictionary
        """
        existing_job = await self._find_from_db(document_chunk.content_hash)
        if existing_job and existing_job.status == "ready" and existing_job.parsed_data:
            logger.info(
                f"Cache hit: Found existing job with hash {document_chunk.content_hash}")
            return existing_job.parsed_data

        job_data = await self._parse_job_data(document_chunk.raw_text)

        if existing_job:
            existing_job.title = job_data.title
            existing_job.description = document_chunk.raw_text
            existing_job.requirements = [
                req.description for req in job_data.requirements]
            existing_job.responsibilities = job_data.responsibilities
            existing_job.preferred_qualifications = job_data.preferred_qualifications
            existing_job.benefits = job_data.benefits
            existing_job.source = source
            existing_job.source_url = source_url
            existing_job.parsed_data = job_data.model_dump()
            existing_job.status = "ready"
            await existing_job.save_document()
            logger.info(f"Updated existing job {existing_job.id}")
        else:
            await self._save_job(document_chunk, job_data)

        return job_data.model_dump()

    async def from_file(self, file: UploadFile):
        """📄 Process a job description from an uploaded file

        Handles the complete job processing workflow:
        - 📥 Processes the uploaded file into text
        - Delegates to common processing logic

        Args:
            file: Uploaded job description file (PDF, DOCX, etc.)

        Returns:
            Structured job data as a dictionary
        """
        document_chunk = await self.content_processor.process_file(file)
        return await self._process_document_chunk(document_chunk, "file")

    async def from_url(self, url: str):
        """📄 Process a job description from a URL

        Handles the complete job processing workflow for URLs:
        - 🔍 Processes the URL into text
        - Delegates to common processing logic

        Args:
            url: URL of the job description document or web page

        Returns:
            Structured job data as a dictionary
        """
        document_chunk = await self.content_processor.process_url(url)
        return await self._process_document_chunk(document_chunk, "link", url)

    async def from_text(self, text: str, title: str = "Job Description"):
        """📝 Process a job description from raw text

        Handles direct text input for job descriptions:
        - Converts the text to a document chunk
        - Delegates to common processing logic

        Args:
            text: Raw text of the job description
            title: Title for the job (used as filename)

        Returns:
            Structured job data as a dictionary
        """
        # Initialize document chunk from text
        from hashlib import sha256
        content_hash = sha256(text.encode('utf-8')).hexdigest()

        # Process text through content processor for standardized chunking
        raw_chunk = await self.content_processor.process_text(text)

        # Create a document chunk with the job title as filename
        document_chunk = DocumentChunk(
            content_hash=content_hash,
            raw_text=raw_chunk.raw_text,
            file_name=title,
            metadata=raw_chunk.metadata
        )

        return await self._process_document_chunk(document_chunk, "text")

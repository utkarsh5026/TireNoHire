from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from uuid import UUID
from models import JobCreate, Job
from services.document_processor import DocumentProcessor
from services.jobs import JobDescriptionExtractor
from services.content_processor import ContentProcessor
from db import JobDB
from loguru import logger

router = APIRouter()


@router.post("/from-url")
async def create_job_from_url(background_tasks: BackgroundTasks, url: Optional[str] = None, body: dict = None):
    """Create a job description directly from a URL"""
    try:
        # Extract URL from either query param or request body
        job_url = url
        if not job_url and body and "url" in body:
            job_url = body["url"]

        if not job_url:
            raise HTTPException(status_code=400, detail="URL is required")

        # Process URL content
        content_processor = ContentProcessor()
        document_chunk = await content_processor.process_url(job_url)

        # Check if we already have this job in the database
        existing_job = await JobDB.find_one({"content_hash": document_chunk.content_hash})

        if existing_job and existing_job.status == "ready" and existing_job.parsed_data:
            logger.info(
                f"Cache hit: Found existing job with hash {document_chunk.content_hash}")
            return existing_job.parsed_data

        # Process new job description
        job_description_extractor = JobDescriptionExtractor()
        parsed_data = await job_description_extractor.parse_job_description(
            document_chunk.raw_text)

        # Store in DB if it's new
        if not existing_job:
            new_job = JobDB(
                content_hash=document_chunk.content_hash,
                title=parsed_data.title,
                description=document_chunk.raw_text,
                requirements=[
                    req.description for req in parsed_data.requirements],
                responsibilities=parsed_data.responsibilities,
                preferred_qualifications=parsed_data.preferred_qualifications,
                benefits=parsed_data.benefits,
                source="link",
                source_url=job_url,
                status="ready",
                parsed_data=parsed_data.dict()
            )
            await new_job.save_document()
            logger.info(f"Created new job {new_job.id}")
        else:
            # Update existing record
            existing_job.parsed_data = parsed_data.model_dump()
            existing_job.status = "ready"
            await existing_job.save_document()
            logger.info(f"Updated existing job {existing_job.id}")

        return parsed_data.model_dump()

    except Exception as e:
        logger.error(f"Error creating job from URL: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating job from URL: {str(e)}"
        )


@router.post("/", response_model=Job)
async def create_job(job_create: JobCreate, background_tasks: BackgroundTasks):
    """Create a job description from text or URL"""
    try:
        # Generate a hash for the job description text to use as a cache key
        from hashlib import sha256
        content_hash = sha256(
            job_create.description.encode('utf-8')).hexdigest()

        # Check for existing job with same content
        existing_job = await JobDB.find_one({"content_hash": content_hash})

        if existing_job and existing_job.status == "ready":
            logger.info(
                f"Cache hit: Found existing job with hash {content_hash}")
            return Job(
                id=existing_job.job_id,
                title=existing_job.title,
                description=existing_job.description,
                requirements=existing_job.requirements,
                responsibilities=existing_job.responsibilities,
                preferred_qualifications=existing_job.preferred_qualifications,
                benefits=existing_job.benefits,
                source=existing_job.source,
                source_url=existing_job.source_url,
                status=existing_job.status,
                created_at=existing_job.created_at,
                error=existing_job.error
            )

        # Create new job in DB
        job_db = JobDB(
            content_hash=content_hash,
            title=job_create.title,
            description=job_create.description,
            requirements=job_create.requirements,
            responsibilities=job_create.responsibilities,
            preferred_qualifications=job_create.preferred_qualifications,
            benefits=job_create.benefits,
            source=job_create.source,
            source_url=job_create.source_url,
            status="processing"
        )
        await job_db.save_document()

        if job_create.source == "link" and job_create.source_url:
            async def process_job_from_url():
                try:
                    # Get the job from DB
                    db_job = await JobDB.get(job_db.id)

                    # Extract content from URL
                    doc_processor = DocumentProcessor()
                    text_content = await doc_processor.extract_text_from_url(job_create.source_url)

                    # Update the content hash
                    new_hash = sha256(text_content.encode('utf-8')).hexdigest()

                    # Check if we already have this content
                    existing = await JobDB.find_one({
                        "content_hash": new_hash,
                        "id": {"$ne": db_job.id}
                    })

                    if existing and existing.status == "ready" and existing.parsed_data:
                        # Copy data from existing job
                        db_job.content_hash = new_hash
                        db_job.title = existing.title
                        db_job.description = existing.description
                        db_job.requirements = existing.requirements
                        db_job.responsibilities = existing.responsibilities
                        db_job.preferred_qualifications = existing.preferred_qualifications
                        db_job.benefits = existing.benefits
                        db_job.parsed_data = existing.parsed_data
                        db_job.status = "ready"
                        await db_job.save_document()
                        logger.info(f"Used cached job data for {db_job.id}")
                        return

                    # Parse the job
                    job_extractor = JobDescriptionExtractor()
                    parsed_data = await job_extractor.parse_job_description(text_content)

                    # Update job in DB
                    db_job.content_hash = new_hash
                    db_job.title = parsed_data.title
                    db_job.requirements = [
                        req.description for req in parsed_data.requirements]
                    db_job.responsibilities = parsed_data.responsibilities
                    db_job.preferred_qualifications = parsed_data.preferred_qualifications
                    db_job.benefits = parsed_data.benefits
                    db_job.parsed_data = parsed_data.dict()
                    db_job.status = "ready"
                    await db_job.save_document()
                    logger.info(f"Processed and updated job {db_job.id}")

                except Exception as e:
                    # Update with error status
                    db_job = await JobDB.get(job_db.id)
                    db_job.status = "error"
                    db_job.error = str(e)
                    await db_job.save_document()
                    logger.error(f"Error processing job from URL: {str(e)}")

            background_tasks.add_task(process_job_from_url)
        else:
            # For text input, mark as ready immediately
            job_db.status = "ready"
            await job_db.save_document()

        # Return the API model
        return Job(
            id=job_db.job_id,
            title=job_db.title,
            description=job_db.description,
            requirements=job_db.requirements,
            responsibilities=job_db.responsibilities,
            preferred_qualifications=job_db.preferred_qualifications,
            benefits=job_db.benefits,
            source=job_db.source,
            source_url=job_db.source_url,
            status=job_db.status,
            created_at=job_db.created_at
        )

    except Exception as e:
        logger.error(f"Error creating job: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error creating job: {str(e)}")


@router.get("/{job_id}", response_model=Job)
async def get_job(job_id: UUID):
    """Get a job by ID"""
    try:
        job = await JobDB.find_one({"job_id": job_id})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        return Job(
            id=job.job_id,
            title=job.title,
            description=job.description,
            requirements=job.requirements,
            responsibilities=job.responsibilities,
            preferred_qualifications=job.preferred_qualifications,
            benefits=job.benefits,
            source=job.source,
            created_at=job.created_at,
            status=job.status,
            error=job.error
        )
    except Exception as e:
        logger.error(f"Error fetching job: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching job: {str(e)}")


@router.get("/", response_model=List[Job])
async def list_jobs():
    """List all jobs"""
    try:
        jobs = await JobDB.find_all().to_list()
        return [
            Job(
                id=job.job_id,
                title=job.title,
                description=job.description,
                requirements=job.requirements,
                responsibilities=job.responsibilities,
                preferred_qualifications=job.preferred_qualifications,
                benefits=job.benefits,
                source=job.source,
                created_at=job.created_at,
                status=job.status,
                error=job.error
            ) for job in jobs
        ]
    except Exception as e:
        logger.error(f"Error listing jobs: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error listing jobs: {str(e)}")

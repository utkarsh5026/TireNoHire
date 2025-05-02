from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    BackgroundTasks,
    status
)
from typing import List, Optional
from uuid import UUID
from models.resume import ResumeCreate, Resume, ResumeUploadResponse
from services.content_processor import ContentProcessor
from services.resume import ResumeExtractor
from db import ResumeDB
from loguru import logger

router = APIRouter()


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None)
):
    """Upload and process a resume file"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided")

    try:

        content_processor = ContentProcessor()
        document_chunk = await content_processor.process_file(file)

        # Check if we already have this resume in the database
        existing_resume = await ResumeDB.find_one({"content_hash": document_chunk.content_hash})

        if existing_resume and existing_resume.status == "ready" and existing_resume.parsed_data:
            logger.info(
                f"Cache hit: Found existing resume with hash {document_chunk.content_hash}")
            return existing_resume.parsed_data

        # Process new resume
        resume_extractor = ResumeExtractor()
        resume_data = await resume_extractor.parse_resume(document_chunk.raw_text)

        # Create or update resume in database
        resume_name = name or file.filename
        if existing_resume:
            existing_resume.name = resume_name
            existing_resume.text_content = document_chunk.raw_text
            existing_resume.parsed_data = resume_data.model_dump()
            existing_resume.status = "ready"
            await existing_resume.save_document()
            logger.info(f"Updated existing resume {existing_resume.id}")
        else:
            new_resume = ResumeDB(
                content_hash=document_chunk.content_hash,
                name=resume_name,
                type="file",
                text_content=document_chunk.raw_text,
                parsed_data=resume_data.model_dump(),
                status="ready"
            )
            await new_resume.save_document()
            logger.info(f"Created new resume {new_resume.id}")

        return resume_data.model_dump()

    except Exception as e:
        logger.error(f"Error processing resume: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error processing resume: {str(e)}")


@router.post("/url", response_model=ResumeUploadResponse)
async def process_resume_url(
    background_tasks: BackgroundTasks,
    resume_create: ResumeCreate
):
    """Process a resume from a URL"""
    if not resume_create.url:
        raise HTTPException(status_code=400, detail="No URL provided")

    # Create resume entry with "processing" status
    resume = ResumeDB(
        name=resume_create.name,
        type="link",
        url=resume_create.url,
        status="processing",
        content_hash=""  # Will be updated after URL processing
    )
    await resume.save_document()

    # Extract and process text in the background
    async def process_resume_from_url(resume_id: str):
        try:
            db_resume = await ResumeDB.get(resume_id)

            # Extract content from URL
            content_processor = ContentProcessor()
            document_chunk = await content_processor.process_url(resume_create.url)

            # Check if we already have this resume content in DB
            existing_resume = await ResumeDB.find_one({
                "content_hash": document_chunk.content_hash,
                "status": "ready",
                "id": {"$ne": resume_id}  # Not the current resume
            })

            if existing_resume and existing_resume.parsed_data:
                # Copy data from existing resume
                db_resume.content_hash = document_chunk.content_hash
                db_resume.text_content = existing_resume.text_content
                db_resume.parsed_data = existing_resume.parsed_data
                db_resume.status = "ready"
                await db_resume.save_document()
                logger.info(f"Used cached resume data for {resume_id}")
                return

            # Process new resume
            resume_extractor = ResumeExtractor()
            resume_data = await resume_extractor.parse_resume(document_chunk.raw_text)

            # Update resume in DB
            db_resume.content_hash = document_chunk.content_hash
            db_resume.text_content = document_chunk.raw_text
            db_resume.parsed_data = resume_data.model_dump()
            db_resume.status = "ready"
            await db_resume.save_document()
            logger.info(f"Processed and saved resume {resume_id}")

        except Exception as e:
            # Update with error status
            db_resume = await ResumeDB.get(resume_id)
            db_resume.status = "error"
            db_resume.error = str(e)
            await db_resume.save_document()
            logger.error(f"Error processing resume URL: {str(e)}")

    background_tasks.add_task(process_resume_from_url, str(resume.id))

    return ResumeUploadResponse(
        id=resume.resume_id,
        name=resume.name,
        type=resume.type,
        uploaded_at=resume.created_at,
        status=resume.status
    )


@router.get("/{resume_id}", response_model=Resume)
async def get_resume(resume_id: UUID):
    """Get a resume by ID"""
    try:
        resume = await ResumeDB.find_one({"resume_id": resume_id})
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        # Convert from DB model to API model
        return Resume(
            id=resume.resume_id,
            name=resume.name,
            type=resume.type,
            uploaded_at=resume.created_at,
            status=resume.status,
            error=resume.error,
            text_content=resume.text_content,
            parsed_data=resume.parsed_data
        )
    except Exception as e:
        logger.error(f"Error fetching resume: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching resume: {str(e)}")


@router.get("/", response_model=List[ResumeUploadResponse])
async def list_resumes():
    """List all resumes"""
    try:
        resumes = await ResumeDB.find_all().to_list()
        return [
            ResumeUploadResponse(
                id=resume.resume_id,
                name=resume.name,
                type=resume.type,
                uploaded_at=resume.created_at,
                status=resume.status
            ) for resume in resumes
        ]
    except Exception as e:
        logger.error(f"Error listing resumes: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error listing resumes: {str(e)}")

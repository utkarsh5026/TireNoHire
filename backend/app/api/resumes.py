# app/api/endpoints/resumes.py
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from typing import List, Optional
from uuid import UUID
from models.resume import ResumeCreate, Resume, ResumeUploadResponse
from services.document_processor import DocumentProcessor
from services.language_model import LanguageModelService

router = APIRouter()

# In-memory storage for demonstration (use a database in production)
resumes_db = {}


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    name: Optional[str] = Form(None)
):
    """Upload and process a resume file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Create resume entry with "processing" status
    resume_name = name or file.filename
    resume = Resume(
        name=resume_name,
        type="file",
        status="processing"
    )

    # Store the resume
    resumes_db[resume.id] = resume

    # Extract text in the background
    async def process_resume(resume_id: UUID):
        try:
            # Reset file position
            await file.seek(0)

            # Extract text
            doc_processor = DocumentProcessor()
            text_content = await doc_processor.extract_text_from_file(file)

            # Parse resume
            language_model = LanguageModelService()
            parsed_data = await language_model.extract_resume_details(text_content)

            # Update resume
            resume = resumes_db[resume_id]
            resume.text_content = text_content
            resume.parsed_data = parsed_data
            resume.status = "ready"
            resumes_db[resume_id] = resume
        except Exception as e:
            # Update with error status
            resume = resumes_db[resume_id]
            resume.status = "error"
            resume.error = str(e)
            resumes_db[resume_id] = resume

    background_tasks.add_task(process_resume, resume.id)

    return ResumeUploadResponse(
        id=resume.id,
        name=resume.name,
        type=resume.type,
        uploaded_at=resume.uploaded_at,
        status=resume.status
    )


@router.post("/url", response_model=ResumeUploadResponse)
async def process_resume_url(
    background_tasks: BackgroundTasks,
    resume_create: ResumeCreate
):
    """Process a resume from a URL"""
    if not resume_create.url:
        raise HTTPException(status_code=400, detail="No URL provided")

    # Create resume entry with "processing" status
    resume = Resume(
        name=resume_create.name,
        type="link",
        url=resume_create.url,
        status="processing"
    )

    # Store the resume
    resumes_db[resume.id] = resume

    # Extract and process text in the background
    async def process_resume_from_url(resume_id: UUID):
        try:
            # Extract text
            doc_processor = DocumentProcessor()
            text_content = await doc_processor.extract_text_from_url(resume_create.url)

            # Parse resume
            language_model = LanguageModelService()
            parsed_data = await language_model.extract_resume_details(text_content)

            # Update resume
            resume = resumes_db[resume_id]
            resume.text_content = text_content
            resume.parsed_data = parsed_data
            resume.status = "ready"
            resumes_db[resume_id] = resume
        except Exception as e:
            # Update with error status
            resume = resumes_db[resume_id]
            resume.status = "error"
            resume.error = str(e)
            resumes_db[resume_id] = resume

    background_tasks.add_task(process_resume_from_url, resume.id)

    return ResumeUploadResponse(
        id=resume.id,
        name=resume.name,
        type=resume.type,
        uploaded_at=resume.uploaded_at,
        status=resume.status
    )


@router.get("/{resume_id}", response_model=Resume)
async def get_resume(resume_id: UUID):
    """Get a resume by ID"""
    if resume_id not in resumes_db:
        raise HTTPException(status_code=404, detail="Resume not found")

    return resumes_db[resume_id]


@router.get("/", response_model=List[ResumeUploadResponse])
async def list_resumes():
    """List all resumes"""
    return [
        ResumeUploadResponse(
            id=resume.id,
            name=resume.name,
            type=resume.type,
            uploaded_at=resume.uploaded_at,
            status=resume.status
        ) for resume in resumes_db.values()
    ]

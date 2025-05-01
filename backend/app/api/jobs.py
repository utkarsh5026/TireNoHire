from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from uuid import UUID
from app.models import JobCreate, Job
from app.services.document_processor import DocumentProcessor
from app.services.language_model import LanguageModelService

router = APIRouter()

# In-memory storage for demonstration
jobs_db = {}


@router.post("/", response_model=Job)
async def create_job(job_create: JobCreate, background_tasks: BackgroundTasks):
    """Create a job description from text or URL"""
    # Create job with "processing" status
    job = Job(
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

    if job_create.source == "link" and job_create.source_url:
        async def process_job_from_url():
            try:
                doc_processor = DocumentProcessor()
                text_content = await doc_processor.extract_text_from_url(job_create.source_url)

                language_model = LanguageModelService()
                parsed_data = await language_model.extract_job_details(text_content)

                job.title = parsed_data.get("title", job.title)
                job.requirements = parsed_data.get(
                    "skills", []) + parsed_data.get("required_qualifications", [])
                job.responsibilities = parsed_data.get("responsibilities", [])
                job.preferred_qualifications = parsed_data.get(
                    "preferred_qualifications", [])
                job.benefits = parsed_data.get("benefits", [])
                job.status = "ready"
                jobs_db[job.id] = job
            except Exception as e:
                # Update with error status
                job.status = "error"
                job.error = str(e)
                jobs_db[job.id] = job

        background_tasks.add_task(process_job_from_url)
    else:
        job.status = "ready"

    # Store the job
    jobs_db[job.id] = job

    return job


@router.get("/{job_id}", response_model=Job)
async def get_job(job_id: UUID):
    """Get a job by ID"""
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")

    return jobs_db[job_id]


@router.get("/", response_model=List[Job])
async def list_jobs():
    """List all jobs"""
    return list(jobs_db.values())

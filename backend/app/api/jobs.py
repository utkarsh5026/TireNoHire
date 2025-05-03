from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    status,
)
from typing import Optional
from pydantic import BaseModel
from loguru import logger
from app.engine import job_engine

router = APIRouter()


class UrlRequest(BaseModel):
    url: str


class TextRequest(BaseModel):
    title: str
    description: str
    requirements: list[str]
    responsibilities: list[str]
    preferred_qualifications: Optional[list[str]] = None
    benefits: Optional[list[str]] = None
    source: str = "text"


@router.post("/upload")
async def upload_job(
    file: UploadFile = File(...),
):
    """Upload and process a job description file"""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided")

    try:
        return await job_engine.from_file(file)
    except Exception as e:
        logger.error(f"Error processing job description: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing job description: {str(e)}"
        )


@router.post("/url")
async def process_job_url(
    url_request: UrlRequest,
):
    """Process a job description from a URL"""
    if not url_request.url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No URL provided"
        )
    try:
        return await job_engine.from_url(url_request.url)
    except Exception as e:
        logger.error(f"Error processing job description: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing job description: {str(e)}"
        )

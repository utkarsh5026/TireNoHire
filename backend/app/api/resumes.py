from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    status
)
from typing import Optional
from loguru import logger
from app.engine import resume_engine
from pydantic import BaseModel

router = APIRouter()


class UrlRequest(BaseModel):
    url: str


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
        return await resume_engine.from_file(file)
    except Exception as e:
        logger.error(f"Error processing resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume: {str(e)}"
        )


@router.post("/url")
async def process_resume_url(
    url_request: UrlRequest
):
    """Process a resume from a URL"""
    if not url_request.url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No URL provided"
        )
    try:
        return await resume_engine.from_url(url_request.url)
    except Exception as e:
        logger.error(f"Error processing resume: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume: {str(e)}"
        )

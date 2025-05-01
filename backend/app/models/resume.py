from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID, uuid4


class ResumeBase(BaseModel):
    name: str
    type: str  # "file" or "link"


class ResumeCreate(ResumeBase):
    url: Optional[str] = None


class ResumeInDB(ResumeBase):
    id: UUID = Field(default_factory=uuid4)
    uploaded_at: datetime = Field(default_factory=datetime.now)
    status: str = "processing"  # "uploading", "processing", "ready", "error"
    error: Optional[str] = None
    text_content: Optional[str] = None
    parsed_data: Optional[Dict[str, Any]] = None


class Resume(ResumeInDB):
    pass


class ResumeUploadResponse(BaseModel):
    id: UUID
    name: str
    type: str
    uploaded_at: datetime
    status: str

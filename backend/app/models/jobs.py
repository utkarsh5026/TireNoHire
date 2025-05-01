from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID, uuid4


class JobBase(BaseModel):
    title: str
    description: str
    requirements: List[str]
    responsibilities: List[str]
    preferred_qualifications: Optional[List[str]] = None
    benefits: Optional[List[str]] = None


class JobCreate(JobBase):
    source: str = "text"  # "text" or "link"
    source_url: Optional[str] = None


class JobInDB(JobBase):
    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.now)
    status: str = "processing"  # "processing", "ready", "error"
    error: Optional[str] = None


class Job(JobInDB):
    source: str  # Add this field to include it in responses

from beanie import Document
from typing import Optional, Any
from datetime import datetime
from uuid import UUID, uuid4
from pydantic import Field


class BaseDocument(Document):
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        use_state_management = True

    async def save_document(self):
        self.updated_at = datetime.now()
        return await self.save()

# Resume document


class ResumeDB(BaseDocument):
    content_hash: str = Field(index=True)  # Use content hash for cache lookup
    resume_id: UUID = Field(default_factory=uuid4)
    name: str
    type: str  # "file" or "link"
    url: Optional[str] = None
    status: str = "processing"  # "uploading", "processing", "ready", "error"
    error: Optional[str] = None
    text_content: Optional[str] = None
    parsed_data: Optional[dict[str, Any]] = None

    class Settings:
        name = "resumes"
        indexes = [
            "content_hash",
            "resume_id"
        ]

# Job document


class JobDB(BaseDocument):
    content_hash: str = Field(index=True)  # Use content hash for cache lookup
    job_id: UUID = Field(default_factory=uuid4)
    title: str
    description: str
    requirements: list[str]
    responsibilities: list[str]
    preferred_qualifications: Optional[list[str]] = None
    benefits: Optional[list[str]] = None
    source: str = "text"  # "text" or "link"
    source_url: Optional[str] = None
    status: str = "processing"  # "processing", "ready", "error"
    error: Optional[str] = None
    parsed_data: Optional[dict[str, Any]] = None

    class Settings:
        name = "jobs"
        indexes = [
            "content_hash",
            "job_id"
        ]


class MatchAnalysisDB(BaseDocument):
    match_id: UUID = Field(default_factory=uuid4)
    resume_id: UUID
    job_id: UUID
    overall_score: int
    summary: str
    section_scores: list[dict[str, Any]]
    skill_matches: list[dict[str, Any]]
    experience_matches: list[dict[str, Any]]
    education_matches: list[dict[str, Any]]
    keyword_matches: list[dict[str, Any]]
    improvement_suggestions: list[dict[str, Any]]

    class Settings:
        name = "matches"
        indexes = [
            "resume_id",
            "job_id"
        ]

    @property
    def cache_key(self) -> str:
        return f"{self.resume_id}_{self.job_id}"

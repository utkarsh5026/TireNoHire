from typing import Optional, Any, List
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


class MatchAnalysisDB(Document):
    match_id: UUID = Field(default_factory=uuid4)
    resume_id: UUID
    job_id: UUID
    overall_score: int
    summary: str
    section_scores: List[dict[str, Any]]
    skill_matches: List[dict[str, Any]]
    experience_matches: List[dict[str, Any]]
    education_matches: List[dict[str, Any]]
    keyword_matches: List[dict[str, Any]]
    improvement_suggestions: List[dict[str, Any]]

    # Enhanced fields from the Seeker analyzer
    key_strengths: Optional[List[str]] = None
    key_gaps: Optional[List[str]] = None
    competitiveness: Optional[str] = None
    ats_optimization_tips: Optional[List[dict[str, Any]]] = None
    interview_preparation: Optional[List[str]] = None
    career_path_alignment: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        name = "matches"
        indexes = [
            "resume_id",
            "job_id",
            [("resume_id", 1), ("job_id", 1)]
        ]

    async def save_document(self):
        self.updated_at = datetime.now()
        return await self.save()

    @property
    def cache_key(self) -> str:
        return f"{self.resume_id}_{self.job_id}"

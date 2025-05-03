from typing import Optional, Any, List, Literal
from beanie import Document
from typing import Optional, Any
from datetime import datetime
from uuid import UUID, uuid4
from pydantic import Field, HttpUrl
from app.services.jobs import JobData
from app.services.resume import ResumeData


class BaseDocument(Document):
    """📄 Base document model for all database collections

    Provides common fields and functionality for all document types:
    - ⏰ Automatic timestamp tracking
    - 💾 Simplified save method with timestamp updates
    - 🔄 State management for tracking changes

    All other document models should inherit from this base class.
    """
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    class Settings:
        use_state_management = True

    async def save_document(self):
        """💾 Save document with automatic timestamp update

        Updates the 'updated_at' field to the current time before saving.

        Returns:
            The saved document instance
        """
        self.updated_at = datetime.now()
        return await self.save()


class ResumeDB(BaseDocument):
    """📝 Resume document model for storing resume data

    Stores both raw resume content and structured parsed data:
    - 🔑 Unique identifiers and content hash for deduplication
    - 📄 Original text content from the resume
    - 🧩 Structured data extracted from parsing
    - 🔗 Source information (file or link)
    """
    content_hash: str = Field(index=True)
    """🔑 Unique hash of the resume content for deduplication"""

    resume_id: UUID = Field(default_factory=uuid4)
    """🔑 Unique identifier for the resume"""

    name: str
    """👤 Name of the resume or document"""

    type: Literal["file", "link"]
    """🔗 Source type of the resume (file upload or link)"""

    url: Optional[HttpUrl] = None
    """🔗 URL source of the resume if type is 'link'"""

    text_content: Optional[str] = None
    """📄 Raw text content extracted from the resume"""

    parsed_data: Optional[ResumeData] = None
    """🧩 Structured data extracted from parsing the resume"""

    class Settings:
        name = "resumes"
        indexes = [
            "content_hash",
            "resume_id"
        ]


class JobDB(BaseDocument):
    """💼 Job document model for storing job description data

    Stores both raw job description content and structured parsed data:
    - 🔑 Unique identifiers and content hash for deduplication
    - 📋 Job details including title, description, requirements
    - 📊 Structured components like responsibilities and qualifications
    - 🔗 Source information (text input or link)
    - 🧩 Complete parsed data for analysis
    """
    content_hash: str = Field(index=True)
    """🔑 Unique identifiers and content hash for deduplication"""

    job_id: UUID = Field(default_factory=uuid4)
    """🔑 Unique identifier for the job"""

    title: str
    """💼 Title of the job"""

    description: str
    """💼 Description of the job"""

    requirements: list[str]
    """💼 Requirements of the job"""

    responsibilities: list[str]
    """💼 Responsibilities of the job"""

    preferred_qualifications: Optional[list[str]] = None
    """💼 Preferred qualifications of the job"""

    benefits: Optional[list[str]] = None
    """💼 Benefits of the job"""

    source: Literal["text", "link", "file"] = "text"
    """🔗 Source information (text input or link)"""

    source_url: Optional[HttpUrl] = None
    """🔗 Source URL of the job"""

    parsed_data: Optional[JobData] = None
    """🧩 Complete parsed data for analysis"""
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

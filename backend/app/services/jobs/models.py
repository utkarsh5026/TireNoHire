from pydantic import BaseModel, Field
from typing import Optional


class JobRequirement(BaseModel):
    description: str
    required: bool
    category: str = Field(
        description="Category like 'technical', 'soft skill', 'experience', etc.")
    importance: int = Field(ge=1, le=10, description="Importance from 1-10")


class JobData(BaseModel):
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    description: str
    requirements: list[JobRequirement] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    preferred_qualifications: Optional[list[str]] = None
    benefits: Optional[list[str]] = None
    salary_range: Optional[str] = None
    industry: Optional[str] = None

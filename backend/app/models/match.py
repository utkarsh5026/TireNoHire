# app/models/match.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID, uuid4


class SkillMatch(BaseModel):
    skill: str
    resume_level: int  # 0-100
    job_importance: int  # 0-100
    match: int  # 0-100
    suggestions: Optional[str] = None


class ExperienceMatch(BaseModel):
    area: str
    resume_level: int  # 0-100
    job_requirement: int  # 0-100
    match: int  # 0-100
    suggestions: Optional[str] = None


class EducationMatch(BaseModel):
    requirement: str
    fulfilled: bool
    score: int  # 0-100
    suggestions: Optional[str] = None


class KeywordMatch(BaseModel):
    keyword: str
    occurrences_in_resume: int
    occurrences_in_job: int
    importance: int  # 0-100


class SectionScore(BaseModel):
    name: str
    score: int  # 0-100
    weight: int  # 0-100
    details: str


class ImprovementSuggestion(BaseModel):
    priority: str  # "High", "Medium", "Low"
    section: str
    suggestion: str


class MatchAnalysisCreate(BaseModel):
    resume_id: UUID
    job_id: UUID


class MatchAnalysis(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    resume_id: UUID
    job_id: UUID
    overall_score: int  # 0-100
    summary: str
    section_scores: List[SectionScore]
    skill_matches: List[SkillMatch]
    experience_matches: List[ExperienceMatch]
    education_matches: List[EducationMatch]
    keyword_matches: List[KeywordMatch]
    improvement_suggestions: List[ImprovementSuggestion]
    created_at: datetime = Field(default_factory=datetime.now)

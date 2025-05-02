from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from uuid import UUID, uuid4


class SkillMatch(BaseModel):
    skill: str
    resume_level: int  # 0-100
    job_importance: int  # 0-100
    match: int  # 0-100
    category: str  # Technical, Soft, etc.
    gap_description: Optional[str] = None  # Description of the skill gap
    suggestions: Optional[str] = None  # Suggestions for improvement
    alternatives: Optional[list[str]] = None  # Alternative skills that could compensate

class ExperienceMatch(BaseModel):
    area: str
    resume_level: int  # 0-100
    job_requirement: int  # 0-100
    match: int  # 0-100
    years_needed: Optional[float] = None
    years_present: Optional[float] = None
    context: Optional[str] = None  # Where this experience is important in the role
    suggestions: Optional[str] = None  # Suggestions for improvement

class EducationMatch(BaseModel):
    requirement: str
    fulfilled: bool
    score: int  # 0-100
    relevance: int  # 0-100, how relevant the education is to the job
    alternatives: Optional[list[str]] = None  # Alternative qualifications that could substitute
    suggestions: Optional[str] = None  # Suggestions for improvement

class KeywordMatch(BaseModel):
    keyword: str
    occurrences_in_resume: int
    occurrences_in_job: int
    importance: int  # 0-100
    context_job: Optional[str] = None  # Context in job description
    context_resume: Optional[str] = None  # Context in resume
    category: Optional[str] = None  # Category of the keyword

class SectionScore(BaseModel):
    name: str
    score: int  # 0-100
    weight: int  # 0-100
    strengths: list[str]  # Key strengths in this section
    weaknesses: list[str]  # Key weaknesses in this section
    details: str

class ImprovementSuggestion(BaseModel):
    priority: str  # "High", "Medium", "Low"
    section: str
    suggestion: str
    implementation_difficulty: str  # "Easy", "Medium", "Hard"
    impact: int  # 1-10, potential impact on match score
    timeframe: str  # "Immediate", "Short-term", "Long-term"

class AtsOptimizationTip(BaseModel):
    description: str
    current_text: Optional[str] = None
    suggested_text: Optional[str] = None
    reason: str


class MatchAnalysis(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    resume_id: UUID
    job_id: UUID
    overall_score: int  # 0-100
    competitiveness: Optional[str] = None  # How competitive the candidate is
    summary: str
    key_strengths: list[str]  # Top strengths relative to the job
    key_gaps: list[str]  # Top gaps relative to the job
    section_scores: list[SectionScore]
    skill_matches: list[SkillMatch]
    experience_matches: list[ExperienceMatch]
    education_matches: list[EducationMatch]
    keyword_matches: list[KeywordMatch]
    improvement_suggestions: list[ImprovementSuggestion]
    ats_optimization_tips: Optional[list[AtsOptimizationTip]] = None
    interview_preparation: Optional[list[str]] = None
    career_path_alignment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
from fastapi import status

from app.services.base_extractor.base import BaseExtractor
from langchain_core.output_parsers import PydanticOutputParser
from typing import Any
from fastapi import HTTPException
from loguru import logger
from datetime import datetime

from .models import MatchAnalysis
from .prompts import JOB_SEEKER_USER_PROMPT, JOB_SEEKER_SYSTEM_PROMPT
from app.services.jobs import JobData
from app.services.resume import ResumeData


class MatchAnalyzer(BaseExtractor):
    """
    Enhanced analyzer for matching resumes to job descriptions with deeper insights
    and more actionable recommendations.
    """

    def __init__(self, model_name: str = "gpt-4o-mini"):
        """Initialize with a more powerful model for accurate analysis"""
        super().__init__(model_name=model_name)
        logger.info(
            f"Initialized EnhancedMatchAnalyzer with model: {model_name}")

    async def analyze_match(self, resume_data: ResumeData, job_data: JobData) -> MatchAnalysis:
        """
        Perform an in-depth analysis of how well a resume matches a job description,
        with detailed section breakdowns and actionable feedback.
        """
        try:
            return await self._analyze_match(resume_data, job_data)

        except Exception as e:
            logger.error(f"Error analyzing match: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error analyzing match: {str(e)}")

    async def _analyze_match(self, resume_data: ResumeData, job_data: JobData) -> MatchAnalysis:
        """
        Perform enhanced analysis using the improved models and more detailed prompts.
        """
        parser = PydanticOutputParser(pydantic_object=MatchAnalysis)

        result = await self.generate_pydantic_result(
            parser=parser,
            system_prompt=JOB_SEEKER_SYSTEM_PROMPT,
            user_prompt=JOB_SEEKER_USER_PROMPT,
            format_kwargs={
                "job_title": job_data.title,
                "job_company": job_data.company,
                "job_location": job_data.location,
                "job_type": job_data.type,
                "job_seniority": job_data.seniority,
                "job_skills": job_data.skills,
                "job_responsibilities": job_data.responsibilities,
                "job_required_qualifications": job_data.required_qualifications,
                "job_preferred_qualifications": job_data.preferred_qualifications,
                "job_benefits": job_data.benefits,
                "resume_contact_info": resume_data.contact_info,
                "resume_summary": resume_data.summary,
                "resume_education": resume_data.education,
                "resume_experience": resume_data.experience,
                "resume_skills": resume_data.skills,
                "resume_certifications": resume_data.certifications,
                "resume_projects": resume_data.projects,
                "format_instructions": parser.get_format_instructions()
            }
        )

        return result

    async def batch_analyze(self, resumes: list[ResumeData], job: JobData) -> list[MatchAnalysis]:
        """
        Analyze multiple resumes against a single job (for recruiters).
        This is optimized for batch processing with enhanced analysis.
        """
        results = []
        for resume in resumes:
            try:
                analysis = await self.analyze_match(resume, job)
                results.append(analysis)
            except Exception as e:
                logger.error(
                    f"Error analyzing resume {resume.get('id', 'unknown')}: {str(e)}")

        results.sort(key=lambda x: x.overall_score, reverse=True)
        return results

    @classmethod
    async def compare_candidates(cls, analyses: list[MatchAnalysis]) -> dict[str, Any]:
        """
        Compare multiple candidates against each other based on their match analyses.
        This provides insights into the strengths and weaknesses of each candidate relative to others.

        Returns a structured comparison with rankings in different categories.
        """
        if not analyses or len(analyses) < 2:
            raise ValueError("Need at least two candidates to compare")

        # Extract key data from analyses
        candidates = []
        for analysis in analyses:
            skill_avg = sum(skill.match for skill in analysis.skill_matches) / \
                len(analysis.skill_matches) if analysis.skill_matches else 0
            exp_avg = sum(exp.match for exp in analysis.experience_matches) / \
                len(analysis.experience_matches) if analysis.experience_matches else 0
            edu_avg = sum(edu.score for edu in analysis.education_matches) / \
                len(analysis.education_matches) if analysis.education_matches else 0

            candidates.append({
                "resume_id": analysis.resume_id,
                "overall_score": analysis.overall_score,
                "skill_score": skill_avg,
                "experience_score": exp_avg,
                "education_score": edu_avg,
                "improvement_count": len(analysis.improvement_suggestions),
                "high_priority_improvements": len([s for s in analysis.improvement_suggestions if s.priority == "High"])
            })

        # Sort candidates by different criteria
        rankings = {
            "overall": sorted(candidates, key=lambda x: x["overall_score"], reverse=True),
            "skills": sorted(candidates, key=lambda x: x["skill_score"], reverse=True),
            "experience": sorted(candidates, key=lambda x: x["experience_score"], reverse=True),
            "education": sorted(candidates, key=lambda x: x["education_score"], reverse=True),
            "fewest_gaps": sorted(candidates, key=lambda x: x["high_priority_improvements"])
        }

        # Calculate percentiles and rankings
        for category, ranked_list in rankings.items():
            for i, candidate in enumerate(ranked_list):
                candidate[f"{category}_rank"] = i + 1
                candidate[f"{category}_percentile"] = round(
                    (len(ranked_list) - i) / len(ranked_list) * 100)

        return {
            "job_id": analyses[0].job_id if analyses else None,
            "candidate_count": len(candidates),
            "rankings": rankings,
            "candidates": candidates,
            "comparison_date": datetime.now().isoformat()
        }

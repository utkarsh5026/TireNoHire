from fastapi import status

from app.services.base_extractor.base import BaseExtractor
from langchain_core.output_parsers import PydanticOutputParser
from typing import Any
from fastapi import HTTPException
from loguru import logger
from datetime import datetime

from .models import MatchAnalysis
from .prompts import JOB_SEEKER_USER_PROMPT, JOB_SEEKER_SYSTEM_PROMPT


class MatchAnalyzer(BaseExtractor):
    """
    Enhanced analyzer for matching resumes to job descriptions with deeper insights
    and more actionable recommendations.
    """

    def __init__(self, model_name: str = "gpt-4o"):
        """Initialize with a more powerful model for accurate analysis"""
        super().__init__(model_name=model_name)
        logger.info(
            f"Initialized EnhancedMatchAnalyzer with model: {model_name}")

    async def analyze_match(self, resume_data: dict[str, Any], job_data: dict[str, Any]) -> MatchAnalysis:
        """
        Perform an in-depth analysis of how well a resume matches a job description,
        with detailed section breakdowns and actionable feedback.
        """
        try:
            return await self._analyze_match_enhanced(resume_data, job_data)

        except Exception as e:
            logger.error(f"Error analyzing match: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error analyzing match: {str(e)}")

    async def _analyze_match_enhanced(self, resume_data: dict[str, Any], job_data: dict[str, Any]) -> MatchAnalysis:
        """
        Perform enhanced analysis using the improved models and more detailed prompts.
        """
        # Create parser for enhanced match analysis
        parser = PydanticOutputParser(pydantic_object=MatchAnalysis)



        parsed_resume = resume_data.get("parsed_data", {})
        contact_info = parsed_resume.get("contact_info", {})
        summary = parsed_resume.get("summary", "")
        education = parsed_resume.get("education", [])
        experience = parsed_resume.get("experience", [])
        skills = parsed_resume.get("skills", [])
        certifications = parsed_resume.get("certifications", [])
        projects = parsed_resume.get("projects", [])

        # From job data
        title = job_data.get("title", "")
        company = job_data.get("company", {})
        location = job_data.get("location", "")
        job_type = job_data.get("type", "")
        seniority = job_data.get("seniority", "")
        skills_list = job_data.get("skills", [])
        responsibilities = job_data.get("responsibilities", [])
        required_qualifications = job_data.get("required_qualifications", [])
        preferred_qualifications = job_data.get("preferred_qualifications", [])
        benefits = job_data.get("benefits", [])

        # Generate the enhanced analysis
        result = await self.generate_pydantic_result(
            parser=parser,
            system_prompt=JOB_SEEKER_SYSTEM_PROMPT,
            user_prompt=JOB_SEEKER_USER_PROMPT,
            format_kwargs={
                "job_title": title,
                "job_company": company,
                "job_location": location,
                "job_type": job_type,
                "job_seniority": seniority,
                "job_skills": skills_list,
                "job_responsibilities": responsibilities,
                "job_required_qualifications": required_qualifications,
                "job_preferred_qualifications": preferred_qualifications,
                "job_benefits": benefits,
                "resume_contact_info": contact_info,
                "resume_summary": summary,
                "resume_education": education,
                "resume_experience": experience,
                "resume_skills": skills,
                "resume_certifications": certifications,
                "resume_projects": projects,
                "format_instructions": parser.get_format_instructions()
            }
        )

        return result


    async def batch_analyze(self, resumes: list[dict[str, Any]], job: dict[str, Any]) -> list[MatchAnalysis]:
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
                # Log the error but continue with other resumes
                logger.error(
                    f"Error analyzing resume {resume.get('id', 'unknown')}: {str(e)}")

        # Sort results by overall score (highest first)
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

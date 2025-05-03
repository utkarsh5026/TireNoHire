from app.services.base_extractor.base import BaseExtractor
from langchain_core.output_parsers import PydanticOutputParser
from typing import Any
from uuid import uuid4
from fastapi import HTTPException
from loguru import logger
from datetime import datetime

from .models import MatchAnalysis


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
            # Try to use enhanced analysis if possible, but fall back to standard analysis if needed
            try:
                return await self._analyze_match_enhanced(resume_data, job_data)
            except Exception as e:
                logger.warning(
                    f"Enhanced analysis failed: {str(e)}. Falling back to standard analysis.")
                return await self._analyze_match_standard(resume_data, job_data)

        except Exception as e:
            logger.error(f"Error analyzing match: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Error analyzing match: {str(e)}")

    async def _analyze_match_enhanced(self, resume_data: dict[str, Any], job_data: dict[str, Any]) -> MatchAnalysis:
        """
        Perform enhanced analysis using the improved models and more detailed prompts.
        """
        # Create parser for enhanced match analysis
        parser = PydanticOutputParser(pydantic_object=MatchAnalysis)

        # System prompt with comprehensive analysis instructions
        system_prompt = """
        You are an expert recruiting assistant with extensive experience in talent acquisition, 
        resume screening, and applicant tracking systems across multiple industries.
        
        Your task is to thoroughly analyze how well a candidate's resume matches a specific job 
        description and provide detailed, actionable feedback. Your analysis must be 
        comprehensive, fair, highly practical, and data-driven.
        
        ANALYSIS GUIDELINES:
        
        1. Evaluate Holistically:
           - Consider both explicit and implicit qualifications
           - Weigh the relative importance of different requirements
           - Assess both technical fit and cultural/team alignment
           - Consider career trajectory and growth potential
        
        2. Be Objective But Nuanced:
           - Focus on substantive qualifications, not formatting
           - Recognize transferable skills from different industries
           - Consider quality of experience, not just duration
           - Identify patterns that indicate potential success
        
        3. Provide Actionable Insights:
           - For job seekers: Specific ways to improve their candidacy
           - For recruiters: Clear assessment of fit and potential
           - Include both short-term and long-term recommendations
           - Highlight unique strengths that differentiate the candidate
        
        4. Consider ATS Optimization:
           - Identify keyword gaps affecting ATS scoring
           - Suggest phrasing changes to improve parsing
           - Note formatting issues that might affect digital processing
        
        5. Prepare for Next Steps:
           - Suggest interview preparation points
           - Highlight areas the candidate should be ready to discuss
           - Identify potential concerns a hiring manager might have
        
        Your output must be balanced, noting both strengths and gaps, and structured exactly
        according to the specified schema.
        """

        # Enhanced user prompt with more detailed structure for analysis
        user_prompt = """
        ## JOB DESCRIPTION DETAILS:
        
        Title: {job_title}
        
        Company Details:
        {job_company}
        
        Location: {job_location}
        Type: {job_type}
        Seniority: {job_seniority}
        
        Required Skills: 
        {job_skills}
        
        Responsibilities: 
        {job_responsibilities}
        
        Required Qualifications: 
        {job_required_qualifications}
        
        Preferred Qualifications: 
        {job_preferred_qualifications}
        
        Benefits & Culture:
        {job_benefits}
        
        ## RESUME DETAILS:
        
        Contact & Personal Info: 
        {resume_contact_info}
        
        Summary: 
        {resume_summary}
        
        Education: 
        {resume_education}
        
        Experience: 
        {resume_experience}
        
        Skills: 
        {resume_skills}
        
        Certifications: 
        {resume_certifications}
        
        Projects: 
        {resume_projects}
        
        ## ANALYSIS INSTRUCTIONS:
        
        Provide a comprehensive match analysis with the following structured components:
        
        1. Overall Match Score (0-100): A data-driven assessment considering all factors and their relative importance
        
        2. Competitiveness Assessment: How this candidate likely compares to the typical applicant pool
        
        3. Summary (1-2 paragraphs): A concise yet thorough overview highlighting key qualifications and gaps
        
        4. Key Strengths: Top 3-5 specific strengths that make this candidate well-suited for the role
        
        5. Key Gaps: Top 3-5 specific gaps or areas for improvement relative to job requirements
        
        6. Section Scores: Detailed assessment of each major area
           - Skills Match (weight: 40%)
           - Experience Match (weight: 30%)
           - Education Match (weight: 15%)
           - Keyword Match (weight: 15%)
        
        7. Skill Matches: Analyze each important skill with:
           - Skill name and category
           - Resume level (0-100)
           - Job importance (0-100)
           - Match percentage
           - Gap description (if applicable)
           - Improvement suggestions
           - Alternative skills that could compensate
        
        8. Experience Matches: Analyze relevant experience areas with:
           - Area of experience
           - Resume level (0-100)
           - Job requirement level (0-100)
           - Years needed vs. years present
           - Context within the role
           - Improvement suggestions
        
        9. Education Matches: Analyze educational requirements with:
           - Requirement
           - Fulfilled status (boolean)
           - Score (0-100)
           - Relevance to the position (0-100)
           - Alternative qualifications
           - Suggestions if applicable
        
        10. Keyword Matches: Identify important keywords with:
           - Keyword
           - Occurrences in resume
           - Occurrences in job description
           - Importance (0-100)
           - Context in job description
           - Context in resume
        
        11. Improvement Suggestions: Provide actionable recommendations with:
           - Priority (High, Medium, Low)
           - Section
           - Detailed, specific suggestion
           - Implementation difficulty
           - Potential impact (1-10)
           - Implementation timeframe
        
        12. ATS Optimization Tips: Suggestions to improve ATS scoring with:
           - Description
           - Current text (if applicable)
           - Suggested text
           - Reason for the suggestion
        
        13. Interview Preparation: Key points the candidate should be prepared to discuss
        
        14. Career Path Alignment: Assessment of how this role fits the candidate's apparent career trajectory
        
        {format_instructions}
        """

        # Extract data from the input models
        # From resume data
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
            system_prompt=system_prompt,
            user_prompt=user_prompt,
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

        # Return the enhanced analysis with IDs set
        enhanced_analysis = MatchAnalysis(
            id=uuid4(),
            resume_id=resume_data["id"],
            job_id=job_data["id"],
            **result.model_dump(exclude={"id", "resume_id", "job_id"})
        )

        # Convert the enhanced analysis to the standard format for compatibility
        return self._convert_to_standard_analysis(enhanced_analysis)

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

    async def compare_candidates(self, analyses: list[MatchAnalysis]) -> dict[str, Any]:
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

        # Build the comparison result
        return {
            "job_id": analyses[0].job_id if analyses else None,
            "candidate_count": len(candidates),
            "rankings": rankings,
            "candidates": candidates,
            "comparison_date": datetime.now().isoformat()
        }

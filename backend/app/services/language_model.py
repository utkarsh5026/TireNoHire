from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain.chains import LLMChain
from typing import Dict, Any
import json
from uuid import uuid4
from fastapi import HTTPException
from core.config import settings
from models.match import (
    SkillMatch, ExperienceMatch, EducationMatch, KeywordMatch,
    SectionScore, ImprovementSuggestion, MatchAnalysis
)


class LanguageModelService:
    def __init__(self):
        self.llm = ChatOpenAI(
            api_key=settings.OPENAI_API_KEY,
            model_name="gpt-4o-mini",  # Can be configured based on needs
            temperature=0.2  # Lower temperature for more consistent outputs
        )

    async def extract_job_details(self, job_description: str) -> Dict[str, Any]:
        """Extract structured information from a job description"""
        prompt_template = """
        You are an expert at analyzing job descriptions. Extract the following information from the job description below:
        
        1. Job title
        2. Required skills (as a list)
        3. Job responsibilities (as a list)
        4. Required qualifications (as a list)
        5. Preferred qualifications (as a list, or empty if none)
        6. Benefits (as a list, or empty if none)
        
        Job Description:
        {job_description}
        
        Provide your response as a valid JSON object with the following keys: 
        "title", "skills", "responsibilities", "required_qualifications", "preferred_qualifications", "benefits"
        """

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["job_description"]
        )

        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = await chain.arun(job_description=job_description)

        try:
            return json.loads(result)
        except json.JSONDecodeError:
            # Handle case where LLM doesn't return proper JSON
            extraction_prompt = f"""
            The following text should be converted to a valid JSON object:
            {result}
            
            Please extract and return ONLY the valid JSON object.
            """
            extraction_result = await self.llm.apredict(extraction_prompt)
            return json.loads(extraction_result)

    async def extract_resume_details(self, resume_text: str) -> Dict[str, Any]:
        """Extract structured information from a resume"""
        prompt_template = """
        You are an expert at analyzing resumes. Extract the following information from the resume below:
        
        1. Contact information (name, email, phone, location)
        2. Education history (as a list with institution, degree, field, dates)
        3. Work experience (as a list with company, position, dates, description)
        4. Skills (as a list)
        5. Certifications (as a list, or empty if none)
        6. Projects (as a list, or empty if none)
        
        Resume:
        {resume_text}
        
        Provide your response as a valid JSON object with the following keys: 
        "contact_info", "education", "experience", "skills", "certifications", "projects"
        """

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["resume_text"]
        )

        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = await chain.arun(resume_text=resume_text)

        try:
            return json.loads(result)
        except json.JSONDecodeError:
            extraction_prompt = f"""
            The following text should be converted to a valid JSON object:
            {result}
            
            Please extract and return ONLY the valid JSON object.
            """
            extraction_result = await self.llm.apredict(extraction_prompt)
            return json.loads(extraction_result)

    async def analyze_match(
        self, resume_data: Dict[str, Any], job_data: Dict[str, Any]
    ) -> MatchAnalysis:
        """Analyze how well a resume matches a job description"""
        prompt_template = """
        You are an expert recruiting assistant with deep experience in matching candidates to job positions.
        Your task is to analyze how well a candidate's resume matches a specific job description and provide detailed feedback.
        
        JOB DESCRIPTION:
        Title: {job_title}
        Skills: {job_skills}
        Responsibilities: {job_responsibilities}
        Required Qualifications: {job_required_qualifications}
        Preferred Qualifications: {job_preferred_qualifications}
        
        RESUME:
        Contact Info: {resume_contact_info}
        Education: {resume_education}
        Experience: {resume_experience}
        Skills: {resume_skills}
        Certifications: {resume_certifications}
        Projects: {resume_projects}
        
        Analyze the match and provide:
        1. An overall match score (0-100)
        2. A summary of the match (1-2 paragraphs)
        3. Detailed section scores with weights:
           - Skills Match (weight: 40%)
           - Experience Match (weight: 30%)
           - Education Match (weight: 15%)
           - Keyword Match (weight: 15%)
        4. Specific skill matches (with resume level, job importance, match percentage)
        5. Experience matches (with resume level, job requirement, match percentage)
        6. Education matches (with fulfilled status and score)
        7. Keyword matches (with occurrences and importance)
        8. Improvement suggestions (with priority level and section)
        
        Format your response as a valid JSON object with the following structure:
        {
          "overall_score": int,
          "summary": string,
          "section_scores": [
            {"name": string, "score": int, "weight": int, "details": string}
          ],
          "skill_matches": [
            {"skill": string, "resume_level": int, "job_importance": int, "match": int, "suggestions": string}
          ],
          "experience_matches": [
            {"area": string, "resume_level": int, "job_requirement": int, "match": int, "suggestions": string}
          ],
          "education_matches": [
            {"requirement": string, "fulfilled": bool, "score": int, "suggestions": string}
          ],
          "keyword_matches": [
            {"keyword": string, "occurrences_in_resume": int, "occurrences_in_job": int, "importance": int}
          ],
          "improvement_suggestions": [
            {"priority": string, "section": string, "suggestion": string}
          ]
        }
        """

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=[
                "job_title", "job_skills", "job_responsibilities",
                "job_required_qualifications", "job_preferred_qualifications",
                "resume_contact_info", "resume_education", "resume_experience",
                "resume_skills", "resume_certifications", "resume_projects"
            ]
        )

        chain = LLMChain(llm=self.llm, prompt=prompt)
        result = await chain.arun(
            job_title=job_data.get("title", ""),
            job_skills=job_data.get("skills", []),
            job_responsibilities=job_data.get("responsibilities", []),
            job_required_qualifications=job_data.get(
                "required_qualifications", []),
            job_preferred_qualifications=job_data.get(
                "preferred_qualifications", []),
            resume_contact_info=resume_data.get("contact_info", {}),
            resume_education=resume_data.get("education", []),
            resume_experience=resume_data.get("experience", []),
            resume_skills=resume_data.get("skills", []),
            resume_certifications=resume_data.get("certifications", []),
            resume_projects=resume_data.get("projects", [])
        )

        try:
            # Parse the LLM response into our data model
            analysis_data = json.loads(result)

            return MatchAnalysis(
                id=uuid4(),
                resume_id=resume_data["id"],
                job_id=job_data["id"],
                overall_score=analysis_data["overall_score"],
                summary=analysis_data["summary"],
                section_scores=[SectionScore(
                    **score) for score in analysis_data["section_scores"]],
                skill_matches=[SkillMatch(**skill)
                               for skill in analysis_data["skill_matches"]],
                experience_matches=[ExperienceMatch(
                    **exp) for exp in analysis_data["experience_matches"]],
                education_matches=[EducationMatch(
                    **edu) for edu in analysis_data["education_matches"]],
                keyword_matches=[KeywordMatch(
                    **kw) for kw in analysis_data["keyword_matches"]],
                improvement_suggestions=[ImprovementSuggestion(
                    **sugg) for sugg in analysis_data["improvement_suggestions"]]
            )
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error analyzing match: {str(e)}")

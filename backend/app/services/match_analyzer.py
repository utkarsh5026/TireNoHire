from uuid import UUID
from app.services.language_model import LanguageModelService
from app.models.match import MatchAnalysis
from app.models import Job, Resume


class MatchAnalyzer:
    def __init__(self):
        self.language_model = LanguageModelService()

    async def analyze_match(self, resume: Resume, job: Job) -> MatchAnalysis:
        """Analyze how well a resume matches a job"""
        if not resume.parsed_data:
            raise ValueError("Resume has not been parsed")

        # Prepare job data for analysis
        job_data = {
            "id": job.id,
            "title": job.title,
            "skills": job.requirements,
            "responsibilities": job.responsibilities,
            "required_qualifications": job.requirements,
            "preferred_qualifications": job.preferred_qualifications or []
        }

        # Resume data is already parsed
        resume_data = {
            "id": resume.id,
            **resume.parsed_data
        }

        # Use the language model to analyze the match
        match_analysis = await self.language_model.analyze_match(resume_data, job_data)

        return match_analysis

    async def batch_analyze(self, resumes: list[Resume], job: Job) -> list[MatchAnalysis]:
        """Analyze multiple resumes against a single job (for recruiters)"""
        results = []
        for resume in resumes:
            try:
                analysis = await self.analyze_match(resume, job)
                results.append(analysis)
            except Exception as e:
                # Log the error but continue with other resumes
                print(f"Error analyzing resume {resume.id}: {str(e)}")

        # Sort results by overall score (highest first)
        results.sort(key=lambda x: x.overall_score, reverse=True)
        return results

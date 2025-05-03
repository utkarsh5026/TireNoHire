from uuid import UUID
from typing import  Any, Optional
from app.services.analyzer.seeker import MatchAnalyzer
from app.services.analyzer.models import MatchAnalysis
from .resume import ResumeEngine
from .jobs import JobEngine
from app.db import MatchAnalysisDB, ResumeDB, JobDB
from fastapi import HTTPException
from loguru import logger


class MatchEngine:
    """🔍 Match analysis engine for comparing resumes to job descriptions

    Orchestrates the complete resume-to-job matching workflow:
    - 📊 Fetches resume and job data using their respective engines
    - 🧠 Analyzes the match using advanced LLM-powered analysis
    - 💾 Caches results for improved performance
    - 📈 Provides detailed match reports with actionable insights

    The engine handles various input formats and ensures consistent,
    high-quality match analysis across different use cases.
    """

    def __init__(self):
        """🏗️ Initialize the match engine with required components

        Sets up connections to the resume and job engines for data retrieval,
        and initializes the match analyzer for performing the analysis.
        """
        self.resume_engine = ResumeEngine()
        self.job_engine = JobEngine()
        self.match_analyzer = MatchAnalyzer()
        logger.info("Match Engine initialized")

    async def _check_cache(self, resume_id: UUID, job_id: UUID) -> Optional[MatchAnalysis]:
        """🔍 Check if a match analysis is already cached

        Looks up previous analyses to avoid redundant processing.

        Args:
            resume_id: ID of the resume
            job_id: ID of the job description

        Returns:
            Cached match analysis if found, None otherwise
        """
        try:
            existing_match = await MatchAnalysisDB.find_one({
                "resume_id": resume_id,
                "job_id": job_id
            })

            if existing_match:
                logger.info(
                    f"Cache hit: Found existing match analysis for {resume_id} and {job_id}")

                # Convert DB model to API model
                return MatchAnalysis(
                    id=existing_match.match_id,
                    resume_id=existing_match.resume_id,
                    job_id=existing_match.job_id,
                    overall_score=existing_match.overall_score,
                    summary=existing_match.summary,
                    key_strengths=existing_match.get("key_strengths", []),
                    key_gaps=existing_match.get("key_gaps", []),
                    section_scores=existing_match.section_scores,
                    skill_matches=existing_match.skill_matches,
                    experience_matches=existing_match.experience_matches,
                    education_matches=existing_match.education_matches,
                    keyword_matches=existing_match.keyword_matches,
                    improvement_suggestions=existing_match.improvement_suggestions,
                    ats_optimization_tips=existing_match.get(
                        "ats_optimization_tips", []),
                    interview_preparation=existing_match.get(
                        "interview_preparation", []),
                    career_path_alignment=existing_match.get(
                        "career_path_alignment", ""),
                    competitiveness=existing_match.get("competitiveness", ""),
                    created_at=existing_match.created_at
                )

            return None
        except Exception as e:
            logger.error(f"Error checking match cache: {str(e)}")
            return None

    async def _save_match_analysis(self, analysis: MatchAnalysis) -> None:
        """💾 Save match analysis to the database

        Stores the analysis results for future retrieval and caching.

        Args:
            analysis: Match analysis to save
        """
        try:
            # Use model_dump for Pydantic v2 compatibility
            analysis_dict = analysis.model_dump() if hasattr(
                analysis, 'model_dump') else analysis.dict()

            # Create DB model
            match_db = MatchAnalysisDB(
                match_id=analysis.id,
                resume_id=analysis.resume_id,
                job_id=analysis.job_id,
                overall_score=analysis.overall_score,
                summary=analysis.summary,
                section_scores=analysis_dict.get("section_scores", []),
                skill_matches=analysis_dict.get("skill_matches", []),
                experience_matches=analysis_dict.get("experience_matches", []),
                education_matches=analysis_dict.get("education_matches", []),
                keyword_matches=analysis_dict.get("keyword_matches", []),
                improvement_suggestions=analysis_dict.get(
                    "improvement_suggestions", []),
                key_strengths=analysis_dict.get("key_strengths", []),
                key_gaps=analysis_dict.get("key_gaps", []),
                competitiveness=analysis_dict.get("competitiveness", ""),
                ats_optimization_tips=analysis_dict.get(
                    "ats_optimization_tips", []),
                interview_preparation=analysis_dict.get(
                    "interview_preparation", []),
                career_path_alignment=analysis_dict.get(
                    "career_path_alignment", "")
            )

            await match_db.save_document()
            logger.info(f"Saved match analysis {match_db.id}")

        except Exception as e:
            logger.error(f"Error saving match analysis: {str(e)}")
            # Don't raise the exception - failing to cache shouldn't stop the analysis
            # from being returned to the user

    async def _get_resume_data(self, resume_id: UUID) -> dict[str, Any]:
        """📄 Retrieve resume data for analysis

        Fetches resume data from the database and validates it.

        Args:
            resume_id: ID of the resume

        Returns:
            Resume data in the format expected by the analyzer

        Raises:
            HTTPException: If resume not found or not ready
        """
        # Get resume from DB
        resume = await ResumeDB.find_one({"resume_id": resume_id})
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        # Check if resume is ready
        if resume.status != "ready":
            raise HTTPException(
                status_code=400, detail=f"Resume is not ready for analysis (status: {resume.status})")

        # Check if parsed data exists
        if not resume.parsed_data:
            raise HTTPException(
                status_code=400, detail="Resume has not been parsed")

        # Return data in the expected format
        return {
            "id": resume.resume_id,
            "parsed_data": resume.parsed_data
        }

    async def _get_job_data(self, job_id: UUID) -> dict[str, Any]:
        """📄 Retrieve job data for analysis

        Fetches job data from the database and validates it.

        Args:
            job_id: ID of the job

        Returns:
            Job data in the format expected by the analyzer

        Raises:
            HTTPException: If job not found or not ready
        """
        # Get job from DB
        job = await JobDB.find_one({"job_id": job_id})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Check if job is ready
        if job.status != "ready":
            raise HTTPException(
                status_code=400, detail=f"Job is not ready for analysis (status: {job.status})")

        # Return data in the expected format
        return {
            "id": job.job_id,
            "title": job.title,
            "requirements": job.requirements,
            "responsibilities": job.responsibilities,
            "preferred_qualifications": job.preferred_qualifications or [],
            "benefits": job.benefits or [],
            "parsed_data": job.parsed_data
        }

    async def analyze_match(self, resume_id: UUID, job_id: UUID, force_refresh: bool = False) -> MatchAnalysis:
        """🧠 Analyze how well a resume matches a job description

        Performs a comprehensive analysis of the match between a resume and job:
        1. Retrieves resume and job data
        2. Checks cache for existing analysis
        3. Performs analysis using AI if needed
        4. Saves results for future use

        Args:
            resume_id: ID of the resume to analyze
            job_id: ID of the job to match against
            force_refresh: Whether to force a new analysis even if cached

        Returns:
            Detailed match analysis with scores and recommendations

        Raises:
            HTTPException: If any validation or processing errors occur
        """
        try:
            # Try to get from cache first if not forcing refresh
            if not force_refresh:
                cached_analysis = await self._check_cache(resume_id, job_id)
                if cached_analysis:
                    return cached_analysis

            # Get resume and job data
            resume_data = await self._get_resume_data(resume_id)
            job_data = await self._get_job_data(job_id)

            # Extract parsed data for analysis
            if job_data.get("parsed_data"):
                # Use the parsed data if available
                analysis_job_data = job_data["parsed_data"]
                # Ensure ID is set for tracking
                analysis_job_data["id"] = job_data["id"]
            else:
                # Fallback to basic job data
                analysis_job_data = {
                    "id": job_data["id"],
                    "title": job_data["title"],
                    "skills": job_data["requirements"],
                    "responsibilities": job_data["responsibilities"],
                    "required_qualifications": job_data["requirements"],
                    "preferred_qualifications": job_data["preferred_qualifications"]
                }

            # Perform the analysis
            logger.info(
                f"Analyzing match between resume {resume_id} and job {job_id}")
            match_analysis = await self.match_analyzer.analyze_match(resume_data, analysis_job_data)

            # Save for future use
            await self._save_match_analysis(match_analysis)

            return match_analysis

        except HTTPException as e:
            # Re-raise HTTP exceptions without modification
            raise
        except Exception as e:
            logger.error(f"Error analyzing match: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Error analyzing match: {str(e)}")

    async def batch_analyze(self, resume_ids: list[UUID], job_id: UUID, force_refresh: bool = False) -> list[MatchAnalysis]:
        """📊 Analyze multiple resumes against a single job

        Useful for recruiters to compare multiple candidates:
        1. Retrieves job data
        2. Processes each resume individually
        3. Sorts results by overall score

        Args:
            resume_ids: List of resume IDs to analyze
            job_id: ID of the job to match against
            force_refresh: Whether to force new analyzes even if cached

        Returns:
            List of match analyzes sorted by overall score (highest first)

        Raises:
            HTTPException: If any critical processing errors occur
        """
        try:
            # Get the job data once
            job_data = await self._get_job_data(job_id)

            # Process resumes and collect valid ones
            results = []
            for resume_id in resume_ids:
                try:
                    # Try to analyze each resume individually
                    analysis = await self.analyze_match(resume_id, job_id, force_refresh)
                    results.append(analysis)
                except HTTPException as e:
                    # Log but continue with other resumes
                    if e.status_code == 404:
                        logger.warning(
                            f"Resume {resume_id} not found, skipping")
                    else:
                        logger.error(
                            f"Error analyzing resume {resume_id}: {e.detail}")
                except Exception as e:
                    # Log but continue with other resumes
                    logger.error(
                        f"Unexpected error analyzing resume {resume_id}: {str(e)}")

            if not results:
                raise HTTPException(
                    status_code=400, detail="No valid resumes to analyze")

            # Sort by overall score (highest first)
            results.sort(key=lambda x: x.overall_score, reverse=True)
            return results

        except HTTPException as e:
            # Re-raise HTTP exceptions for job data
            if "Job not found" in str(e.detail) or "Job is not ready" in str(e.detail):
                raise
            raise HTTPException(status_code=e.status_code, detail=e.detail)
        except Exception as e:
            logger.error(f"Error in batch analysis: {str(e)}")
            raise HTTPException(
                status_code=500, detail=f"Error in batch analysis: {str(e)}")

    async def compare_resumes(self, resume_ids: list[UUID], job_id: UUID) -> dict[str, Any]:
        """🏆 Compare multiple resumes against each other for a job

        Provides a detailed comparison of candidates:
        1. Analyzes each resume against the job
        2. Generates comparison metrics across various dimensions
        3. Ranks candidates in different categories

        Args:
            resume_ids: List of resume IDs to compare
            job_id: ID of the job to match against

        Returns:
            Structured comparison with rankings and insights

        Raises:
            HTTPException: If any processing errors occur
        """
        # Get match analyses for all resumes
        analyses = await self.batch_analyze(resume_ids, job_id)

        if len(analyses) < 2:
            raise HTTPException(
                status_code=400,
                detail="Need at least two valid resumes to compare"
            )

        # Use the analyzer's compare_candidates method
        try:
            comparison = await self.match_analyzer.compare_candidates(analyses)
            return comparison
        except Exception as e:
            logger.error(f"Error comparing candidates: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error comparing candidates: {str(e)}"
            )

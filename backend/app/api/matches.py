from fastapi import (
    APIRouter, HTTPException, Query, Body, File, UploadFile, status)
from typing import List, Optional, Any
from uuid import UUID
from pydantic import BaseModel, HttpUrl
from app.services.analyzer.models import MatchAnalysis
from app.engine import resume_match_engine, job_engine, resume_engine
from loguru import logger
from app.services.jobs.models import JobData
from app.services.resume.models import ResumeData


class MatchAnalysisCreate(BaseModel):
    resume_id: UUID
    job_id: UUID
    force_refresh: Optional[bool] = False


class BatchAnalysisRequest(BaseModel):
    resume_ids: List[UUID]
    job_id: UUID
    force_refresh: Optional[bool] = False


class ComparisonRequest(BaseModel):
    resume_ids: List[UUID]
    job_id: UUID


router = APIRouter()


class DirectComparisonRequest(BaseModel):
    """Request model for direct file and URL comparison without pre-saved IDs"""
    job_urls: list[HttpUrl]
    resume_urls: Optional[list[HttpUrl]] = None

    class Config:
        schema_extra = {
            "example": {
                "job_urls": ["https://example.com/job1", "https://example.com/job2"],
                "resume_urls": ["https://example.com/resume1", "https://example.com/resume2"]
            }
        }


class ComparisonResult(BaseModel):
    """Response model for direct comparison results"""
    job_title: str
    job_company: Optional[str] = None
    analyses: List[dict[str, Any]]

    class Config:
        schema_extra = {
            "example": {
                "job_title": "Software Engineer",
                "job_company": "Example Corp",
                "analyses": [
                    {
                        "resume_name": "John Doe Resume",
                        "overall_score": 85,
                        "summary": "Strong match with key skills...",
                        "detailed_analysis": {"...": "..."}
                    }
                ]
            }
        }


@router.post("/direct-comparison", response_model=List[ComparisonResult])
async def direct_comparison(
        job_urls: Optional[List[str]] = Body(None),
        resume_urls: Optional[List[str]] = Body(None),
        resume_files: Optional[List[UploadFile]] = File(None),
        job_files: Optional[List[UploadFile]] = File(None),
        job_text: Optional[str] = Body(None),
        resume_text: Optional[str] = Body(None)
):
    """Process and compare resumes against job descriptions directly

    This endpoint allows direct submission of resumes and job descriptions through:
    - URLs (job_urls, resume_urls)
    - File uploads (resume_files, job_files)
    - Direct text input (job_text, resume_text)

    It returns a comprehensive analysis for each job-resume combination.

    Note: At least one job source and one resume source must be provided.
    """
    try:
        if not any([job_urls, job_files, job_text]):
            raise HTTPException(
                status_code=400,
                detail="At least one job source (URL, file, or text) must be provided"
            )

        if not any([resume_urls, resume_files, resume_text]):
            raise HTTPException(
                status_code=400,
                detail="At least one resume source (URL, file, or text) must be provided"
            )

        processed_jobs: list[JobData] = []

        if job_urls:
            for url in job_urls:
                try:
                    job_data = await job_engine.from_url(url)
                    processed_jobs.append(job_data)
                except Exception as e:
                    logger.error(f"Error processing job URL {url}: {str(e)}")

        # From files
        if job_files:
            for file in job_files:
                try:
                    job_data = await job_engine.from_file(file)
                    processed_jobs.append(job_data)
                except Exception as e:
                    logger.error(
                        f"Error processing job file {file.filename}: {str(e)}")

        # From text
        if job_text:
            try:
                job_data = await job_engine.from_text(job_text)
                processed_jobs.append(job_data)
            except Exception as e:
                logger.error(f"Error processing job text: {str(e)}")

        if not processed_jobs:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to process any job descriptions"
            )

        processed_resumes: list[ResumeData] = []

        if resume_urls:
            for url in resume_urls:
                try:
                    resume_data = await resume_engine.from_url(url)
                    processed_resumes.append(resume_data)
                except Exception as e:
                    logger.error(
                        f"Error processing resume URL {url}: {str(e)}")

        if resume_files:
            for file in resume_files:
                try:
                    resume_data = await resume_engine.from_file(file)
                    processed_resumes.append(resume_data)
                except Exception as e:
                    logger.error(
                        f"Error processing resume file {file.filename}: {str(e)}")

        if not processed_resumes:
            raise HTTPException(
                status_code=400,
                detail="Failed to process any resumes"
            )

        results = []
        for job in processed_jobs:
            job_analyses = []

            for resume in processed_resumes:
                try:
                    analysis_result = await resume_match_engine.match_analyzer.analyze_match(
                        resume,
                        job
                    )

                    logger.info(
                        f"Analysis result: {analysis_result.model_dump()}")

                    job_analyses.append({
                        "resume_name": resume.contact_info.name,
                        "overall_score": analysis_result.overall_score,
                        "summary": analysis_result.summary,
                        "detailed_analysis": analysis_result.model_dump(mode='json')
                    })

                except Exception as e:
                    logger.error(
                        f"Error analyzing {resume.contact_info.name} for {job.title}: {str(e)}")

            if job_analyses:
                results.append(ComparisonResult(
                    job_title=job.title,
                    job_company=job.company,
                    analyses=job_analyses
                ))

        return results

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            f"Unexpected error in direct comparison: {e.__traceback__}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing direct comparison: {str(e)}"
        )


@router.post("/analyze", response_model=MatchAnalysis)
async def analyze_match(match_create: MatchAnalysisCreate):
    """Analyze match between a resume and job description

    Provides a comprehensive analysis of how well a resume matches a job,
    including skill matches, experience evaluation, education assessment,
    and personalized recommendations for improvement.
    """
    try:
        return await resume_match_engine.analyze_match(
            match_create.resume_id,
            match_create.job_id,
            match_create.force_refresh
        )
    except HTTPException as e:
        # Pass through HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in analyze_match: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error analyzing match: {str(e)}")


@router.post("/batch-analyze", response_model=List[MatchAnalysis])
async def batch_analyze(request: BatchAnalysisRequest):
    """Analyze matches between multiple resumes and a job description (for recruiters)

    Evaluates multiple candidates against a single job posting,
    returning detailed match analyzes sorted by overall fit.
    Ideal for recruiters screening multiple candidates.
    """
    try:
        return await resume_match_engine.batch_analyze(
            request.resume_ids,
            request.job_id,
            request.force_refresh
        )
    except HTTPException as e:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in batch_analyze: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error in batch analysis: {str(e)}")


@router.post("/compare-candidates")
async def compare_candidates(request: ComparisonRequest):
    """Compare multiple candidates against each other for a specific job

    Provides a detailed comparison of candidates across different dimensions,
    including skills, experience, education, and overall fit.
    Generates rankings for each candidate in various categories.
    """
    try:
        return await resume_match_engine.compare_resumes(
            request.resume_ids,
            request.job_id
        )
    except HTTPException as e:
        # Pass through HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error in compare_candidates: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error comparing candidates: {str(e)}")


@router.get("/job/{job_id}", response_model=List[MatchAnalysis])
async def get_matches_by_job(
    job_id: UUID,
    min_score: Optional[int] = Query(
        None, ge=0, le=100, description="Minimum match score")
):
    """Get all match analyses for a specific job (for recruiters)

    Retrieves all stored match analyses for a specific job posting,
    optionally filtered by minimum match score.
    Results are sorted by overall score (highest first).
    """
    try:
        # Get analyses using batch analyse with all resumes for this job
        from app.db import MatchAnalysisDB

        # Find all existing matches for this job
        matches = await MatchAnalysisDB.find({"job_id": job_id}).to_list()

        # Extract resume IDs
        resume_ids = [match.resume_id for match in matches]

        if not resume_ids:
            return []

        # Use batch analyze to get fresh data with latest models
        results = await resume_match_engine.batch_analyze(resume_ids, job_id)

        # Apply min_score filter if provided
        if min_score is not None:
            results = [r for r in results if r.overall_score >= min_score]

        return results
    except Exception as e:
        logger.error(f"Error getting matches by job: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error getting matches by job: {str(e)}")


@router.get("/resume/{resume_id}", response_model=List[MatchAnalysis])
async def get_matches_by_resume(
    resume_id: UUID,
    min_score: Optional[int] = Query(
        None, ge=0, le=100, description="Minimum match score")
):
    """Get all match analyses for a specific resume

    Retrieves all job matches for a particular resume,
    optionally filtered by minimum match score.
    Results are sorted by overall score (highest first).
    """
    try:
        from app.db import MatchAnalysisDB

        # Find all existing matches for this resume
        matches = await MatchAnalysisDB.find({"resume_id": resume_id}).to_list()

        if not matches:
            return []

        # Convert DB models to API models
        results = []
        for match in matches:
            # Get fresh analysis for each match
            try:
                analysis = await resume_match_engine.analyze_match(
                    resume_id,
                    match.job_id
                )
                results.append(analysis)
            except Exception as e:
                logger.warning(
                    f"Error refreshing match {match.match_id}: {str(e)}")
                # Fall back to stored data
                results.append(MatchAnalysis(
                    id=match.match_id,
                    resume_id=match.resume_id,
                    job_id=match.job_id,
                    overall_score=match.overall_score,
                    summary=match.summary,
                    section_scores=match.section_scores,
                    skill_matches=match.skill_matches,
                    experience_matches=match.experience_matches,
                    education_matches=match.education_matches,
                    keyword_matches=match.keyword_matches,
                    improvement_suggestions=match.improvement_suggestions,
                    key_strengths=match.get("key_strengths", []),
                    key_gaps=match.get("key_gaps", []),
                    created_at=match.created_at
                ))

        # Apply min_score filter if provided
        if min_score is not None:
            results = [r for r in results if r.overall_score >= min_score]

        # Sort by overall score (highest first)
        results.sort(key=lambda x: x.overall_score, reverse=True)

        return results
    except Exception as e:
        logger.error(f"Error getting matches by resume: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error getting matches by resume: {str(e)}")

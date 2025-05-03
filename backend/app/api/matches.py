from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from app.services.analyzer.models import MatchAnalysis
from app.engine import resume_match_engine
from loguru import logger


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
        # Get analyses using batch analyze with all resumes for this job
        from db import MatchAnalysisDB

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
        from db import MatchAnalysisDB

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

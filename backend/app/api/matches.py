# app/api/endpoints/matches.py
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from uuid import UUID
from app.models.match import MatchAnalysisCreate, MatchAnalysis
from app.services.match_analyzer import MatchAnalyzer
from app.api.resumes import resumes_db
from app.api.jobs import jobs_db

router = APIRouter()

# In-memory storage for demonstration
matches_db = {}


@router.post("/analyze", response_model=MatchAnalysis)
async def analyze_match(match_create: MatchAnalysisCreate):
    """Analyze match between a resume and job description"""
    # Validate that the resume and job exist
    if match_create.resume_id not in resumes_db:
        raise HTTPException(status_code=404, detail="Resume not found")

    if match_create.job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check if resume and job are ready for analysis
    resume = resumes_db[match_create.resume_id]
    job = jobs_db[match_create.job_id]

    if resume.status != "ready":
        raise HTTPException(
            status_code=400, detail="Resume is not ready for analysis")

    if job.status != "ready":
        raise HTTPException(
            status_code=400, detail="Job is not ready for analysis")

    # Perform the analysis
    match_analyzer = MatchAnalyzer()

    try:
        match_analysis = await match_analyzer.analyze_match(resume, job)
        matches_db[match_analysis.id] = match_analysis
        return match_analysis
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error analyzing match: {str(e)}")


@router.post("/batch-analyze", response_model=List[MatchAnalysis])
async def batch_analyze(
    job_id: UUID,
    resume_ids: List[UUID]
):
    """Analyze matches between multiple resumes and a job description (for recruiters)"""
    # Validate that the job exists
    if job_id not in jobs_db:
        raise HTTPException(status_code=404, detail="Job not found")

    job = jobs_db[job_id]
    if job.status != "ready":
        raise HTTPException(
            status_code=400, detail="Job is not ready for analysis")

    # Collect valid resumes
    valid_resumes = []
    for resume_id in resume_ids:
        if resume_id in resumes_db and resumes_db[resume_id].status == "ready":
            valid_resumes.append(resumes_db[resume_id])

    if not valid_resumes:
        raise HTTPException(
            status_code=400, detail="No valid resumes to analyze")

    # Perform batch analysis
    match_analyzer = MatchAnalyzer()

    try:
        analyses = await match_analyzer.batch_analyze(valid_resumes, job)
        # Store the analyses
        for analysis in analyses:
            matches_db[analysis.id] = analysis
        return analyses
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error in batch analysis: {str(e)}")


@router.get("/job/{job_id}", response_model=List[MatchAnalysis])
async def get_matches_by_job(job_id: UUID):
    """Get all match analyses for a specific job (for recruiters)"""
    matches = []
    for match in matches_db.values():
        if match.job_id == job_id:
            matches.append(match)

    # Sort by overall score (highest first)
    matches.sort(key=lambda x: x.overall_score, reverse=True)
    return matches

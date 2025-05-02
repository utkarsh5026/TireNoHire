from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID
from models.match import MatchAnalysis
from services.match_analyzer import MatchAnalyzer
from db import MatchAnalysisDB, ResumeDB, JobDB
from loguru import logger
from pydantic import BaseModel


class MatchAnalysisCreate(BaseModel):
    resume_id: UUID
    job_id: UUID


router = APIRouter()


@router.post("/analyze", response_model=MatchAnalysis)
async def analyze_match(match_create: MatchAnalysisCreate):
    """Analyze match between a resume and job description"""
    try:
        # Check if we already have this match analysis cached
        cache_key = f"{match_create.resume_id}_{match_create.job_id}"
        existing_match = await MatchAnalysisDB.find_one({
            "resume_id": match_create.resume_id,
            "job_id": match_create.job_id
        })

        if existing_match:
            logger.info(
                f"Cache hit: Found existing match analysis for {cache_key}")
            return MatchAnalysis(
                id=existing_match.match_id,
                resume_id=existing_match.resume_id,
                job_id=existing_match.job_id,
                overall_score=existing_match.overall_score,
                summary=existing_match.summary,
                section_scores=existing_match.section_scores,
                skill_matches=existing_match.skill_matches,
                experience_matches=existing_match.experience_matches,
                education_matches=existing_match.education_matches,
                keyword_matches=existing_match.keyword_matches,
                improvement_suggestions=existing_match.improvement_suggestions,
                created_at=existing_match.created_at
            )

        # Validate that the resume and job exist
        resume = await ResumeDB.find_one({"resume_id": match_create.resume_id})
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        job = await JobDB.find_one({"job_id": match_create.job_id})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Check if resume and job are ready for analysis
        if resume.status != "ready":
            raise HTTPException(
                status_code=400, detail="Resume is not ready for analysis")

        if job.status != "ready":
            raise HTTPException(
                status_code=400, detail="Job is not ready for analysis")

        # Convert DB models to API models for the analyzer
        resume_model = {
            "id": resume.resume_id,
            "parsed_data": resume.parsed_data
        }

        job_model = {
            "id": job.job_id,
            "title": job.title,
            "requirements": job.requirements,
            "responsibilities": job.responsibilities,
            "preferred_qualifications": job.preferred_qualifications or [],
            "benefits": job.benefits or []
        }

        # Perform the analysis
        match_analyzer = MatchAnalyzer()
        match_analysis = await match_analyzer.analyze_match(resume_model, job_model)

        # Store the analysis in DB
        match_db = MatchAnalysisDB(
            match_id=match_analysis.id,
            resume_id=match_analysis.resume_id,
            job_id=match_analysis.job_id,
            overall_score=match_analysis.overall_score,
            summary=match_analysis.summary,
            section_scores=[score.dict()
                            for score in match_analysis.section_scores],
            skill_matches=[skill.dict()
                           for skill in match_analysis.skill_matches],
            experience_matches=[exp.dict()
                                for exp in match_analysis.experience_matches],
            education_matches=[edu.dict()
                               for edu in match_analysis.education_matches],
            keyword_matches=[kw.dict()
                             for kw in match_analysis.keyword_matches],
            improvement_suggestions=[
                sugg.dict() for sugg in match_analysis.improvement_suggestions]
        )
        await match_db.save_document()
        logger.info(f"Created new match analysis {match_db.id}")

        return match_analysis

    except Exception as e:
        logger.error(f"Error analyzing match: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error analyzing match: {str(e)}")


@router.post("/batch-analyze", response_model=List[MatchAnalysis])
async def batch_analyze(
    job_id: UUID,
    resume_ids: List[UUID]
):
    """Analyze matches between multiple resumes and a job description (for recruiters)"""
    try:
        # Validate that the job exists
        job = await JobDB.find_one({"job_id": job_id})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        if job.status != "ready":
            raise HTTPException(
                status_code=400, detail="Job is not ready for analysis")

        # Convert job DB model to API model
        job_model = {
            "id": job.job_id,
            "title": job.title,
            "requirements": job.requirements,
            "responsibilities": job.responsibilities,
            "preferred_qualifications": job.preferred_qualifications or [],
            "benefits": job.benefits or []
        }

        # Collect valid resumes
        valid_resume_models = []
        for resume_id in resume_ids:
            resume = await ResumeDB.find_one({"resume_id": resume_id})
            if resume and resume.status == "ready":
                valid_resume_models.append({
                    "id": resume.resume_id,
                    "parsed_data": resume.parsed_data
                })

        if not valid_resume_models:
            raise HTTPException(
                status_code=400, detail="No valid resumes to analyze")

        # Check which matches are already in the DB
        results = []
        resumes_to_analyze = []

        for resume_model in valid_resume_models:
            # Check if we already have this match
            existing_match = await MatchAnalysisDB.find_one({
                "resume_id": resume_model["id"],
                "job_id": job_id
            })

            if existing_match:
                # Use cached result
                logger.info(
                    f"Using cached match for resume {resume_model['id']} and job {job_id}")
                results.append(MatchAnalysis(
                    id=existing_match.match_id,
                    resume_id=existing_match.resume_id,
                    job_id=existing_match.job_id,
                    overall_score=existing_match.overall_score,
                    summary=existing_match.summary,
                    section_scores=existing_match.section_scores,
                    skill_matches=existing_match.skill_matches,
                    experience_matches=existing_match.experience_matches,
                    education_matches=existing_match.education_matches,
                    keyword_matches=existing_match.keyword_matches,
                    improvement_suggestions=existing_match.improvement_suggestions,
                    created_at=existing_match.created_at
                ))
            else:
                # Need to analyze this one
                resumes_to_analyze.append(resume_model)

        # Perform analysis for new matches
        if resumes_to_analyze:
            match_analyzer = MatchAnalyzer()
            new_analyses = await match_analyzer.batch_analyze(resumes_to_analyze, job_model)

            # Store new analyses in DB
            for analysis in new_analyses:
                match_db = MatchAnalysisDB(
                    match_id=analysis.id,
                    resume_id=analysis.resume_id,
                    job_id=analysis.job_id,
                    overall_score=analysis.overall_score,
                    summary=analysis.summary,
                    section_scores=[score.dict()
                                    for score in analysis.section_scores],
                    skill_matches=[skill.dict()
                                   for skill in analysis.skill_matches],
                    experience_matches=[exp.dict()
                                        for exp in analysis.experience_matches],
                    education_matches=[edu.dict()
                                       for edu in analysis.education_matches],
                    keyword_matches=[kw.dict()
                                     for kw in analysis.keyword_matches],
                    improvement_suggestions=[
                        sugg.model_dump() for sugg in analysis.improvement_suggestions]
                )
                await match_db.save_document()
                logger.info(f"Created new match analysis {match_db.id}")

                # Add to results
                results.append(analysis)

        # Sort results by overall score (highest first)
        results.sort(key=lambda x: x.overall_score, reverse=True)
        return results

    except Exception as e:
        logger.error(f"Error in batch analysis: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error in batch analysis: {str(e)}")


@router.get("/job/{job_id}", response_model=List[MatchAnalysis])
async def get_matches_by_job(job_id: UUID):
    """Get all match analyses for a specific job (for recruiters)"""
    try:
        matches = await MatchAnalysisDB.find({"job_id": job_id}).to_list()

        result = [
            MatchAnalysis(
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
                created_at=match.created_at
            ) for match in matches
        ]

        # Sort by overall score (highest first)
        result.sort(key=lambda x: x.overall_score, reverse=True)
        return result

    except Exception as e:
        logger.error(f"Error getting matches by job: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error getting matches by job: {str(e)}")

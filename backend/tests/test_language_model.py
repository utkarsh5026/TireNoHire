# tests/test_language_model.py
import pytest
import json
from uuid import UUID
services.language_model import LanguageModelService
models.match import MatchAnalysis


@pytest.mark.asyncio
async def test_extract_job_details(mock_language_model_service, sample_job_text_1):
    """Test extraction of structured information from job description"""
    language_model = LanguageModelService()
    result = await language_model.extract_job_details(sample_job_text_1)

    # Verify result structure
    assert "title" in result
    assert "skills" in result
    assert "responsibilities" in result
    assert isinstance(result["skills"], list)
    assert len(result["skills"]) > 0
    assert isinstance(result["responsibilities"], list)
    assert len(result["responsibilities"]) > 0


@pytest.mark.asyncio
async def test_extract_resume_details(mock_language_model_service, sample_resume_text_1):
    """Test extraction of structured information from resume"""
    language_model = LanguageModelService()
    result = await language_model.extract_resume_details(sample_resume_text_1)

    # Verify result structure
    assert "contact_info" in result
    assert "education" in result
    assert "experience" in result
    assert "skills" in result
    assert isinstance(result["skills"], list)
    assert len(result["skills"]) > 0
    assert isinstance(result["education"], list)
    assert isinstance(result["experience"], list)


@pytest.mark.asyncio
async def test_analyze_match(mock_language_model_service, mock_resume_parsed_data, mock_job_parsed_data):
    """Test the analysis of resume-job matching"""
    language_model = LanguageModelService()

    # Add IDs to the test data
    resume_data = {**mock_resume_parsed_data,
                   "id": UUID("00000000-0000-0000-0000-000000000001")}
    job_data = {**mock_job_parsed_data,
                "id": UUID("00000000-0000-0000-0000-000000000002")}

    result = await language_model.analyze_match(resume_data, job_data)

    # Verify result is a MatchAnalysis instance
    assert isinstance(result, MatchAnalysis)
    assert result.resume_id == resume_data["id"]
    assert result.job_id == job_data["id"]
    assert isinstance(result.overall_score, int)
    assert 0 <= result.overall_score <= 100
    assert result.summary
    assert len(result.section_scores) > 0
    assert len(result.skill_matches) > 0
    assert len(result.improvement_suggestions) > 0

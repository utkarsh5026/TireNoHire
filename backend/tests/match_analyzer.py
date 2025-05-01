import pytest
from app.services.match_analyzer import MatchAnalyzer
from app.models.match import MatchAnalysis


@pytest.mark.asyncio
async def test_analyze_match(mock_language_model_service, mock_resume, mock_job):
    """Test the match analyzer's ability to analyze a single resume match"""
    match_analyzer = MatchAnalyzer()

    # Add parsed data to mock resume if it doesn't have it
    if not mock_resume.parsed_data:
        mock_resume.parsed_data = {
            "contact_info": {"name": "John Smith", "email": "john@example.com"},
            "skills": ["React", "TypeScript", "Node.js"],
            "education": [{"institution": "UC Berkeley", "degree": "BS Computer Science"}],
            "experience": [{"company": "TechCorp", "position": "Senior Developer"}],
            "certifications": [],
            "projects": []
        }

    result = await match_analyzer.analyze_match(mock_resume, mock_job)

    # Verify result
    assert isinstance(result, MatchAnalysis)
    assert result.resume_id == mock_resume.id
    assert result.job_id == mock_job.id
    assert isinstance(result.overall_score, int)
    assert 0 <= result.overall_score <= 100
    assert result.summary


@pytest.mark.asyncio
async def test_batch_analyze(mock_language_model_service, mock_resume, mock_job):
    """Test the match analyzer's ability to analyze multiple resumes"""
    match_analyzer = MatchAnalyzer()

    # Add parsed data to mock resume
    if not mock_resume.parsed_data:
        mock_resume.parsed_data = {
            "contact_info": {"name": "John Smith", "email": "john@example.com"},
            "skills": ["React", "TypeScript", "Node.js"],
            "education": [{"institution": "UC Berkeley", "degree": "BS Computer Science"}],
            "experience": [{"company": "TechCorp", "position": "Senior Developer"}],
            "certifications": [],
            "projects": []
        }

    resumes = [mock_resume, mock_resume]

    results = await match_analyzer.batch_analyze(resumes, mock_job)

    # Verify results
    assert isinstance(results, list)
    assert len(results) == 2
    for result in results:
        assert isinstance(result, MatchAnalysis)
        assert result.job_id == mock_job.id
        assert result.resume_id == mock_resume.id

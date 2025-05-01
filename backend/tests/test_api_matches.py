# tests/test_api_matches.py
import pytest
import json
from fastapi.testclient import TestClient
main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_analyze_match(client, mock_language_model_service, mock_resume, mock_job):
    """Test match analysis endpoint"""
    data = {
        "resume_id": str(mock_resume.id),
        "job_id": str(mock_job.id)
    }

    response = client.post("/api/matches/analyze", json=data)

    # Check response
    assert response.status_code == 200
    result = response.json()
    assert "id" in result
    assert result["resume_id"] == str(mock_resume.id)
    assert result["job_id"] == str(mock_job.id)
    assert "overall_score" in result
    assert "summary" in result
    assert "section_scores" in result
    assert "skill_matches" in result
    assert "improvement_suggestions" in result


def test_batch_analyze(client, mock_language_model_service, mock_resume, mock_job):
    """Test batch match analysis endpoint"""
    data = {
        "job_id": str(mock_job.id),
        "resume_ids": [str(mock_resume.id)]
    }

    response = client.post("/api/matches/batch-analyze", json=data)

    # Check response
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, list)
    assert len(results) == 1
    assert results[0]["resume_id"] == str(mock_resume.id)
    assert results[0]["job_id"] == str(mock_job.id)


def test_get_matches_by_job(client, mock_match_analysis):
    """Test getting matches by job ID"""
    response = client.get(f"/api/matches/job/{mock_match_analysis.job_id}")

    # Check response
    assert response.status_code == 200
    results = response.json()
    assert isinstance(results, list)
    assert len(results) >= 1
    assert any(m["id"] == str(mock_match_analysis.id) for m in results)

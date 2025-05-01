# tests/test_end_to_end.py
import pytest
import io
import time
from fastapi.testclient import TestClient
main import app


def test_complete_job_seeker_flow(client, mock_language_model_service, sample_resume_text_1, sample_job_text_1):
    """Test the complete job seeker flow: upload resume, create job, analyze match"""
    # 1. Upload resume
    file_content = b"%PDF-1.5\nTest resume content"
    files = {"file": ("test_resume.pdf", io.BytesIO(
        file_content), "application/pdf")}
    data = {"name": "John Smith Resume"}

    resume_response = client.post(
        "/api/resumes/upload", files=files, data=data)
    assert resume_response.status_code == 200
    resume_data = resume_response.json()
    resume_id = resume_data["id"]

    # Wait for resume processing (would use polling in a real test)
    time.sleep(0.5)

    # 2. Create job description
    job_data = {
        "title": "Senior Frontend Developer",
        "description": sample_job_text_1,
        "requirements": ["React", "TypeScript", "JavaScript"],
        "responsibilities": ["Develop user interfaces", "Optimize applications"],
        "source": "text"
    }

    job_response = client.post("/api/jobs/", json=job_data)
    assert job_response.status_code == 200
    job_data = job_response.json()
    job_id = job_data["id"]

    # 3. Analyze match
    match_data = {
        "resume_id": resume_id,
        "job_id": job_id
    }

    match_response = client.post("/api/matches/analyze", json=match_data)
    assert match_response.status_code == 200
    match_result = match_response.json()

    # Verify match result contains expected data
    assert match_result["resume_id"] == resume_id
    assert match_result["job_id"] == job_id
    assert "overall_score" in match_result
    assert "section_scores" in match_result
    assert "skill_matches" in match_result
    assert "improvement_suggestions" in match_result


def test_complete_recruiter_flow(client, mock_language_model_service, sample_resume_text_1, sample_resume_text_2, sample_job_text_1):
    """Test the complete recruiter flow: create job, upload multiple resumes, batch analyze"""
    # 1. Create job description
    job_data = {
        "title": "Frontend Developer",
        "description": sample_job_text_1,
        "requirements": ["React", "TypeScript", "JavaScript"],
        "responsibilities": ["Develop user interfaces", "Optimize applications"],
        "source": "text"
    }

    job_response = client.post("/api/jobs/", json=job_data)
    assert job_response.status_code == 200
    job_data = job_response.json()
    job_id = job_data["id"]

    # 2. Upload multiple resumes
    resume_ids = []

    # Resume 1
    file_content1 = b"%PDF-1.5\nResume 1 content"
    files = {"file": ("resume1.pdf", io.BytesIO(
        file_content1), "application/pdf")}
    data = {"name": "John Smith Resume"}

    resume_response1 = client.post(
        "/api/resumes/upload", files=files, data=data)
    assert resume_response1.status_code == 200
    resume_ids.append(resume_response1.json()["id"])

    # Resume 2
    file_content2 = b"%PDF-1.5\nResume 2 content"
    files = {"file": ("resume2.pdf", io.BytesIO(
        file_content2), "application/pdf")}
    data = {"name": "Emily Johnson Resume"}

    resume_response2 = client.post(
        "/api/resumes/upload", files=files, data=data)
    assert resume_response2.status_code == 200
    resume_ids.append(resume_response2.json()["id"])

    # Wait for resume processing (would use polling in a real test)
    time.sleep(0.5)

    # 3. Batch analyze matches
    batch_data = {
        "job_id": job_id,
        "resume_ids": resume_ids
    }

    batch_response = client.post("/api/matches/batch-analyze", json=batch_data)
    assert batch_response.status_code == 200
    match_results = batch_response.json()

    # Verify batch results
    assert isinstance(match_results, list)
    assert len(match_results) == 2
    assert match_results[0]["job_id"] == job_id
    assert match_results[1]["job_id"] == job_id
    assert match_results[0]["resume_id"] in resume_ids
    assert match_results[1]["resume_id"] in resume_ids

    # 4. Get matches by job ID
    job_matches_response = client.get(f"/api/matches/job/{job_id}")
    assert job_matches_response.status_code == 200
    job_matches = job_matches_response.json()

    # Verify job matches
    assert isinstance(job_matches, list)
    assert len(job_matches) == 2
    assert all(match["job_id"] == job_id for match in job_matches)

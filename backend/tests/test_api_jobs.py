import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_create_job(client, mock_language_model_service, sample_job_text_1):
    """Test job creation endpoint"""
    job_data = {
        "title": "Senior Frontend Developer",
        "description": sample_job_text_1,
        "requirements": ["React", "TypeScript", "JavaScript"],
        "responsibilities": ["Develop user interfaces", "Optimize applications"],
        "source": "text"
    }

    response = client.post("/api/jobs/", json=job_data)

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["title"] == job_data["title"]
    assert data["status"] == "ready"  # Text source jobs are immediately ready


def test_create_job_from_url(client, mock_language_model_service):
    """Test job creation from URL endpoint"""
    job_data = {
        "title": "Frontend Developer",
        "description": "Job description placeholder",
        "requirements": [],
        "responsibilities": [],
        "preferred_qualifications": [],
        "benefits": [],
        "source": "link",
        "source_url": "https://example.com/job-posting.pdf"
    }

    response = client.post("/api/jobs/", json=job_data)

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["source"] == "link"
    # URL source jobs start as processing
    assert data["status"] == "processing"


def test_get_job(client, mock_job):
    """Test getting a job by ID"""
    response = client.get(f"/api/jobs/{mock_job.id}")

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(mock_job.id)
    assert data["title"] == mock_job.title
    assert data["status"] == mock_job.status


def test_list_jobs(client, mock_job):
    """Test listing all jobs"""
    response = client.get("/api/jobs/")

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(j["id"] == str(mock_job.id) for j in data)

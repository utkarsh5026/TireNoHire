import os
import pytest
from fastapi.testclient import TestClient
from typing import Dict, Any, Generator, List
import uuid
from datetime import datetime
import json

from app.main import app
from app.models import Resume, Job, MatchAnalysis
from app.api.resumes import resumes_db
from app.api.jobs import jobs_db
from app.api.matches import matches_db

TEST_DATA_DIR = os.path.join(os.path.dirname(__file__), "test_data")


@pytest.fixture
def test_client() -> Generator:
    with TestClient(app) as client:
        yield client

    # Clear test databases after each test
    resumes_db.clear()
    jobs_db.clear()
    matches_db.clear()


@pytest.fixture
def sample_resume_text_1() -> str:
    with open(os.path.join(TEST_DATA_DIR, "resume_text_1.txt"), "r") as f:
        return f.read()


@pytest.fixture
def sample_resume_text_2() -> str:
    with open(os.path.join(TEST_DATA_DIR, "resume_text_2.txt"), "r") as f:
        return f.read()


@pytest.fixture
def sample_job_text_1() -> str:
    with open(os.path.join(TEST_DATA_DIR, "job_description_1.txt"), "r") as f:
        return f.read()


@pytest.fixture
def sample_job_text_2() -> str:
    with open(os.path.join(TEST_DATA_DIR, "job_description_2.txt"), "r") as f:
        return f.read()


@pytest.fixture
def mock_resume_parsed_data() -> Dict[str, Any]:
    return {
        "contact_info": {
            "name": "John Smith",
            "email": "john.smith@example.com",
            "phone": "(555) 123-4567",
            "location": "San Francisco, CA"
        },
        "education": [
            {
                "institution": "University of California, Berkeley",
                "degree": "Bachelor of Science",
                "field": "Computer Science",
                "startDate": "2015",
                "endDate": "2019",
                "gpa": 3.8
            }
        ],
        "experience": [
            {
                "company": "TechCorp Inc.",
                "position": "Senior Software Engineer",
                "startDate": "January 2021",
                "endDate": "Present",
                "description": "Developed and maintained React-based frontend applications",
                "achievements": [
                    "Implemented TypeScript best practices",
                    "Led a team of 4 developers",
                    "Created RESTful APIs"
                ],
                "skills": ["React", "TypeScript", "Node.js"]
            },
            {
                "company": "StartupXYZ",
                "position": "Software Engineer",
                "startDate": "June 2019",
                "endDate": "December 2020",
                "description": "Built responsive web applications",
                "achievements": [
                    "Collaborated with UI/UX designers",
                    "Developed microservices",
                    "Participated in Agile development"
                ],
                "skills": ["React", "Redux", "Node.js", "MongoDB"]
            }
        ],
        "skills": [
            "JavaScript", "TypeScript", "Python", "HTML/CSS",
            "React", "Redux", "Angular", "Vue.js",
            "Node.js", "Express", "Django",
            "MongoDB", "PostgreSQL", "MySQL",
            "Git", "Docker", "AWS", "Kubernetes",
            "Agile", "Scrum", "TDD"
        ],
        "certifications": [
            {
                "name": "AWS Certified Developer - Associate",
                "issuer": "Amazon Web Services",
                "date": "2022"
            },
            {
                "name": "MongoDB Certified Developer",
                "issuer": "MongoDB",
                "date": "2021"
            }
        ],
        "projects": [
            {
                "name": "Personal Portfolio Website",
                "description": "Designed and implemented a responsive portfolio website",
                "skills": ["React", "Tailwind CSS", "Framer Motion"]
            },
            {
                "name": "Task Management Application",
                "description": "Built a full-stack task management application",
                "skills": ["MERN Stack", "JWT", "AWS"]
            }
        ]
    }


@pytest.fixture
def mock_job_parsed_data() -> Dict[str, Any]:
    return {
        "title": "Senior Frontend Developer",
        "skills": [
            "JavaScript", "React.js", "TypeScript", "Redux",
            "Hooks", "Context API", "RESTful APIs", "GraphQL"
        ],
        "responsibilities": [
            "Develop user-facing features using React.js",
            "Build reusable components and libraries",
            "Translate designs into code",
            "Optimize applications for speed and scalability",
            "Collaborate with team members and stakeholders",
            "Ensure technical feasibility of UI/UX designs",
            "Maintain code quality",
            "Participate in code reviews and mentoring"
        ],
        "required_qualifications": [
            "4+ years of frontend development experience",
            "Strong proficiency in JavaScript",
            "Understanding of React.js core principles",
            "Experience with React workflows",
            "Familiarity with RESTful APIs and GraphQL",
            "Knowledge of frontend build tools",
            "Experience with TypeScript",
            "Familiarity with code versioning tools",
            "Understanding of cross-browser compatibility"
        ],
        "preferred_qualifications": [
            "Experience with testing frameworks",
            "Knowledge of server-side rendering",
            "Experience with state management libraries",
            "Familiarity with UI component libraries",
            "Understanding of CI/CD pipelines",
            "Experience with responsive design",
            "Knowledge of web accessibility standards"
        ],
        "benefits": [
            "Competitive salary and equity",
            "Health, dental, and vision insurance",
            "Flexible work schedule",
            "Remote work options",
            "Professional development budget",
            "Team retreats and social events",
            "Generous paid time off"
        ]
    }


@pytest.fixture
def mock_resume() -> Resume:
    resume_id = uuid.uuid4()
    resume = Resume(
        id=resume_id,
        name="John_Smith_Resume.pdf",
        type="file",
        uploaded_at=datetime.now(),
        status="ready",
        text_content="Sample resume content",
        parsed_data={
            "contact_info": {"name": "John Smith", "email": "john@example.com"},
            "skills": ["React", "TypeScript", "Node.js"],
            "education": [{"institution": "UC Berkeley", "degree": "BS Computer Science"}],
            "experience": [{"company": "TechCorp", "position": "Senior Developer"}],
            "certifications": [],
            "projects": []
        }
    )
    resumes_db[resume_id] = resume
    return resume


@pytest.fixture
def mock_job() -> Job:
    job_id = uuid.uuid4()
    job = Job(
        id=job_id,
        title="Senior Frontend Developer",
        description="We are seeking an experienced frontend developer...",
        requirements=["React", "TypeScript", "JavaScript"],
        responsibilities=["Develop user interfaces", "Optimize applications"],
        preferred_qualifications=[
            "Experience with GraphQL", "Knowledge of Next.js"],
        created_at=datetime.now(),
        source="text",
        status="ready"
    )
    jobs_db[job_id] = job
    return job


@pytest.fixture
def mock_match_analysis(mock_resume: Resume, mock_job: Job) -> MatchAnalysis:
    match_id = uuid.uuid4()
    match_analysis = MatchAnalysis(
        id=match_id,
        resume_id=mock_resume.id,
        job_id=mock_job.id,
        overall_score=85,
        summary="Strong match with technical skills alignment.",
        section_scores=[
            {
                "name": "Skills Match",
                "score": 90,
                "weight": 40,
                "details": "Strong technical skills match."
            },
            {
                "name": "Experience",
                "score": 80,
                "weight": 30,
                "details": "Relevant experience present."
            }
        ],
        skill_matches=[
            {
                "skill": "React",
                "resume_level": 90,
                "job_importance": 95,
                "match": 92
            },
            {
                "skill": "TypeScript",
                "resume_level": 85,
                "job_importance": 90,
                "match": 88
            }
        ],
        experience_matches=[
            {
                "area": "Frontend Development",
                "resume_level": 85,
                "job_requirement": 90,
                "match": 88
            }
        ],
        education_matches=[
            {
                "requirement": "Computer Science degree",
                "fulfilled": True,
                "score": 100
            }
        ],
        keyword_matches=[
            {
                "keyword": "React",
                "occurrences_in_resume": 5,
                "occurrences_in_job": 4,
                "importance": 95
            }
        ],
        improvement_suggestions=[
            {
                "priority": "Medium",
                "section": "Experience",
                "suggestion": "Add more details about React project work."
            }
        ],
        created_at=datetime.now()
    )
    matches_db[match_id] = match_analysis
    return match_analysis


@pytest.fixture
def mock_language_model_service(monkeypatch):
    async def mock_extract_resume_details(*args, **kwargs):
        with open(os.path.join(TEST_DATA_DIR, "mock_resume_parsed.json"), "r") as f:
            return json.load(f)

    async def mock_extract_job_details(*args, **kwargs):
        with open(os.path.join(TEST_DATA_DIR, "mock_job_parsed.json"), "r") as f:
            return json.load(f)

    async def mock_analyze_match(*args, **kwargs):
        with open(os.path.join(TEST_DATA_DIR, "mock_match_analysis.json"), "r") as f:
            data = json.load(f)
            # Add the required IDs
            data["resume_id"] = str(args[0]["id"])
            data["job_id"] = str(args[1]["id"])
            from app.models.match import (
                MatchAnalysis, SkillMatch, ExperienceMatch,
                EducationMatch, KeywordMatch, SectionScore,
                ImprovementSuggestion
            )
            return MatchAnalysis(
                id=uuid.uuid4(),
                resume_id=uuid.UUID(data["resume_id"]),
                job_id=uuid.UUID(data["job_id"]),
                overall_score=data["overall_score"],
                summary=data["summary"],
                section_scores=[SectionScore(**s)
                                for s in data["section_scores"]],
                skill_matches=[SkillMatch(**s) for s in data["skill_matches"]],
                experience_matches=[ExperienceMatch(
                    **e) for e in data["experience_matches"]],
                education_matches=[EducationMatch(
                    **e) for e in data["education_matches"]],
                keyword_matches=[KeywordMatch(**k)
                                 for k in data["keyword_matches"]],
                improvement_suggestions=[ImprovementSuggestion(
                    **i) for i in data["improvement_suggestions"]]
            )

    # Create mock JSON files for the above functions to use
    os.makedirs(TEST_DATA_DIR, exist_ok=True)

    # Mock resume parsed data
    with open(os.path.join(TEST_DATA_DIR, "mock_resume_parsed.json"), "w") as f:
        json.dump({
            "contact_info": {"name": "John Smith", "email": "john@example.com"},
            "skills": ["React", "TypeScript", "Node.js"],
            "education": [{"institution": "UC Berkeley", "degree": "BS Computer Science"}],
            "experience": [{"company": "TechCorp", "position": "Senior Developer"}],
            "certifications": [],
            "projects": []
        }, f)

    # Mock job parsed data
    with open(os.path.join(TEST_DATA_DIR, "mock_job_parsed.json"), "w") as f:
        json.dump({
            "title": "Senior Frontend Developer",
            "skills": ["React", "TypeScript", "JavaScript"],
            "responsibilities": ["Develop user interfaces", "Optimize applications"],
            "required_qualifications": ["4+ years experience", "Strong JavaScript skills"],
            "preferred_qualifications": ["GraphQL", "Next.js"],
            "benefits": ["Competitive salary", "Remote work options"]
        }, f)

    # Mock match analysis
    with open(os.path.join(TEST_DATA_DIR, "mock_match_analysis.json"), "w") as f:
        json.dump({
            "overall_score": 85,
            "summary": "Strong match with technical skills alignment.",
            "section_scores": [
                {
                    "name": "Skills Match",
                    "score": 90,
                    "weight": 40,
                    "details": "Strong technical skills match."
                },
                {
                    "name": "Experience",
                    "score": 80,
                    "weight": 30,
                    "details": "Relevant experience present."
                }
            ],
            "skill_matches": [
                {
                    "skill": "React",
                    "resume_level": 90,
                    "job_importance": 95,
                    "match": 92
                }
            ],
            "experience_matches": [
                {
                    "area": "Frontend Development",
                    "resume_level": 85,
                    "job_requirement": 90,
                    "match": 88
                }
            ],
            "education_matches": [
                {
                    "requirement": "Computer Science degree",
                    "fulfilled": True,
                    "score": 100
                }
            ],
            "keyword_matches": [
                {
                    "keyword": "React",
                    "occurrences_in_resume": 5,
                    "occurrences_in_job": 4,
                    "importance": 95
                }
            ],
            "improvement_suggestions": [
                {
                    "priority": "Medium",
                    "section": "Experience",
                    "suggestion": "Add more details about React project work."
                }
            ]
        }, f)

    # Apply monkeypatches
    from app.services.language_model import LanguageModelService
    monkeypatch.setattr(LanguageModelService,
                        "extract_resume_details", mock_extract_resume_details)
    monkeypatch.setattr(LanguageModelService,
                        "extract_job_details", mock_extract_job_details)
    monkeypatch.setattr(LanguageModelService,
                        "analyze_match", mock_analyze_match)

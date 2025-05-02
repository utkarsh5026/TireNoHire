from .resume import ResumeEngine
from .jobs import JobEngine

resume_engine = ResumeEngine()
job_engine = JobEngine()

__all__ = ["resume_engine", "job_engine"]

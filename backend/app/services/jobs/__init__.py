from .models import JobRequirement, JobData
from .job_description_extractor import JobDescriptionExtractor

job_description_extractor = JobDescriptionExtractor()

__all__ = ["JobRequirement", "JobData",
           "JobDescriptionExtractor", "job_description_extractor"]

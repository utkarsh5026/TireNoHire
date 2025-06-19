import asyncio
import aiohttp
from typing import List, Optional
from bs4 import BeautifulSoup
from urllib.parse import urlencode
from loguru import logger
from pydantic import BaseModel
from app.core.config import settings
from app.manager import cache_manager


class LinkedInJobPosting(BaseModel):
    """Model for LinkedIn job posting data"""
    job_id: str
    title: str
    company: str
    location: str
    description: str
    posted_date: Optional[str] = None
    job_type: Optional[str] = None  # Full-time, Part-time, etc.
    seniority_level: Optional[str] = None
    employment_type: Optional[str] = None
    job_function: Optional[str] = None
    industries: Optional[List[str]] = None
    url: str
    apply_url: Optional[str] = None
    salary_range: Optional[str] = None


class LinkedInSearchParams(BaseModel):
    """Parameters for LinkedIn job search"""
    keywords: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[str] = None  # full-time, part-time, contract, etc.
    # internship, entry, associate, mid-senior, director, executive
    experience_level: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    remote: Optional[bool] = None
    salary_range: Optional[str] = None
    date_posted: Optional[str] = None  # past-24h, past-week, past-month
    limit: int = 25


class LinkedInJobScraper:
    """
    Service for scraping LinkedIn job postings

    This service handles:
    1. Building LinkedIn search URLs with proper parameters
    2. Making HTTP requests with proper headers to avoid detection
    3. Parsing HTML content to extract job data
    4. Caching results to minimize requests
    5. Handling rate limiting and errors gracefully
    """

    def __init__(self):
        self.base_url = "https://www.linkedin.com/jobs/search"
        self.session = None

        # Headers to mimic a real browser
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        }

    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            headers=self.headers,
            timeout=aiohttp.ClientTimeout(total=30),
            connector=aiohttp.TCPConnector(limit=10)
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()

    def _build_search_url(self, params: LinkedInSearchParams) -> str:
        """
        Build LinkedIn search URL with parameters

        LinkedIn uses specific parameter names:
        - keywords: what you're searching for
        - location: where (city, state, country)
        - f_TPR: time posted (r86400 = 24h, r604800 = week, r2592000 = month)
        - f_JT: job type (F = full-time, P = part-time, C = contract, T = temporary, I = internship)
        - f_E: experience level (1 = internship, 2 = entry, 3 = associate, 4 = mid-senior, 5 = director, 6 = executive)
        - f_WT: remote work (1 = on-site, 2 = remote, 3 = hybrid)
        """
        url_params = {}

        if params.keywords:
            url_params['keywords'] = params.keywords

        if params.location:
            url_params['location'] = params.location

        # Map our parameters to LinkedIn's format
        if params.job_type:
            type_mapping = {
                'full-time': 'F',
                'part-time': 'P',
                'contract': 'C',
                'temporary': 'T',
                'internship': 'I'
            }
            if params.job_type.lower() in type_mapping:
                url_params['f_JT'] = type_mapping[params.job_type.lower()]

        if params.experience_level:
            exp_mapping = {
                'internship': '1',
                'entry': '2',
                'associate': '3',
                'mid-senior': '4',
                'director': '5',
                'executive': '6'
            }
            if params.experience_level.lower() in exp_mapping:
                url_params['f_E'] = exp_mapping[params.experience_level.lower()]

        if params.remote is not None:
            if params.remote:
                url_params['f_WT'] = '2'  # Remote
            else:
                url_params['f_WT'] = '1'  # On-site

        if params.date_posted:
            date_mapping = {
                'past-24h': 'r86400',
                'past-week': 'r604800',
                'past-month': 'r2592000'
            }
            if params.date_posted in date_mapping:
                url_params['f_TPR'] = date_mapping[params.date_posted]

        # Add start parameter for pagination
        url_params['start'] = '0'

        return f"{self.base_url}?{urlencode(url_params)}"

    async def _fetch_page(self, url: str) -> str:
        """Fetch a single page with error handling and caching"""

        # Check cache first
        cache_key = f"linkedin_page:{cache_manager.hash_content(url)}"
        cached_content = cache_manager.get(cache_key)

        if cached_content and settings.CACHE_URL_CONTENT:
            logger.info(f"Cache hit for LinkedIn page: {url}")
            return cached_content

        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    content = await response.text()

                    # Cache the content for 1 hour
                    if settings.CACHE_URL_CONTENT:
                        cache_manager.set(cache_key, content, ttl=3600)

                    return content
                elif response.status == 429:
                    logger.warning("Rate limited by LinkedIn")
                    raise Exception("Rate limited by LinkedIn")
                else:
                    logger.error(
                        f"Failed to fetch LinkedIn page: {response.status}")
                    raise Exception(f"HTTP {response.status}")

        except Exception as e:
            logger.error(f"Error fetching LinkedIn page {url}: {str(e)}")
            raise

    def _parse_job_listings(self, html_content: str, base_url: str) -> List[LinkedInJobPosting]:
        """
        Parse HTML content to extract job listings

        LinkedIn's HTML structure (as of 2024):
        - Job cards are in divs with class containing 'job-search-card'
        - Title is in an h3 with class 'base-search-card__title'
        - Company is in h4 with class 'base-search-card__subtitle' 
        - Location is in span with class 'job-search-card__location'
        - Job links are in the title anchor tag
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        jobs = []

        # Find all job cards
        job_cards = soup.find_all(
            'div', class_=lambda x: x and 'job-search-card' in x)

        for card in job_cards:
            try:
                # Extract job title and URL
                title_element = card.find(
                    'h3', class_=lambda x: x and 'base-search-card__title' in x)
                if not title_element:
                    continue

                title_link = title_element.find('a')
                if not title_link:
                    continue

                title = title_link.get_text(strip=True)
                job_url = title_link.get('href', '')

                # Make URL absolute
                if job_url.startswith('/'):
                    job_url = f"https://www.linkedin.com{job_url}"

                # Extract job ID from URL
                job_id = job_url.split(
                    '/')[-1].split('?')[0] if job_url else str(hash(title))

                # Extract company
                company_element = card.find(
                    'h4', class_=lambda x: x and 'base-search-card__subtitle' in x)
                company = company_element.get_text(
                    strip=True) if company_element else "Unknown Company"

                # Extract location
                location_element = card.find(
                    'span', class_=lambda x: x and 'job-search-card__location' in x)
                location = location_element.get_text(
                    strip=True) if location_element else "Unknown Location"

                # Extract posting date
                date_element = card.find(
                    'time', class_=lambda x: x and 'job-search-card__listdate' in x)
                posted_date = date_element.get(
                    'datetime') if date_element else None

                # Basic description (will be enhanced when fetching full job details)
                description_element = card.find(
                    'p', class_=lambda x: x and 'job-search-card__snippet' in x)
                description = description_element.get_text(
                    strip=True) if description_element else ""

                job = LinkedInJobPosting(
                    job_id=job_id,
                    title=title,
                    company=company,
                    location=location,
                    description=description,
                    posted_date=posted_date,
                    url=job_url
                )

                jobs.append(job)

            except Exception as e:
                logger.warning(f"Error parsing job card: {str(e)}")
                continue

        return jobs

    async def _fetch_full_job_details(self, job: LinkedInJobPosting) -> LinkedInJobPosting:
        """
        Fetch full job details from individual job page
        This gets the complete job description and additional metadata
        """
        try:
            html_content = await self._fetch_page(job.url)
            soup = BeautifulSoup(html_content, 'html.parser')

            # Find the job description container
            description_container = soup.find(
                'div', class_=lambda x: x and 'show-more-less-html__markup' in x)

            if description_container:
                # Extract full description text
                full_description = description_container.get_text(
                    separator='\n', strip=True)
                job.description = full_description

            # Extract additional metadata if available
            criteria_items = soup.find_all(
                'li', class_=lambda x: x and 'description__job-criteria-item' in x)

            for item in criteria_items:
                header = item.find('h3')
                content = item.find('span')

                if header and content:
                    header_text = header.get_text(strip=True).lower()
                    content_text = content.get_text(strip=True)

                    if 'seniority level' in header_text:
                        job.seniority_level = content_text
                    elif 'employment type' in header_text:
                        job.employment_type = content_text
                    elif 'job function' in header_text:
                        job.job_function = content_text
                    elif 'industries' in header_text:
                        job.industries = [ind.strip()
                                          for ind in content_text.split(',')]

            # Extract apply URL
            apply_button = soup.find(
                'a', class_=lambda x: x and 'jobs-apply-button' in x)
            if apply_button:
                job.apply_url = apply_button.get('href', '')

        except Exception as e:
            logger.warning(
                f"Error fetching full details for job {job.job_id}: {str(e)}")

        return job

    async def search_jobs(self, params: LinkedInSearchParams, fetch_full_details: bool = True) -> List[LinkedInJobPosting]:
        """
        Search for jobs on LinkedIn with given parameters

        Args:
            params: Search parameters
            fetch_full_details: Whether to fetch full job descriptions (slower but more detailed)

        Returns:
            List of job postings
        """
        logger.info(
            f"Searching LinkedIn jobs with params: {params.model_dump()}")

        search_url = self._build_search_url(params)
        logger.info(f"LinkedIn search URL: {search_url}")

        try:
            # Fetch the search results page
            html_content = await self._fetch_page(search_url)

            # Parse job listings
            jobs = self._parse_job_listings(html_content, search_url)

            logger.info(f"Found {len(jobs)} initial job listings")

            # Optionally fetch full details for each job
            if fetch_full_details:
                logger.info("Fetching full details for each job...")
                detailed_jobs = []

                # Process jobs with some delay to avoid rate limiting
                for i, job in enumerate(jobs[:params.limit]):
                    try:
                        detailed_job = await self._fetch_full_job_details(job)
                        detailed_jobs.append(detailed_job)

                        # Add delay between requests to be respectful
                        if i < len(jobs) - 1:
                            await asyncio.sleep(1)  # 1 second delay

                    except Exception as e:
                        logger.warning(
                            f"Failed to fetch details for job {job.job_id}: {str(e)}")
                        # Add the job without full details
                        detailed_jobs.append(job)

                jobs = detailed_jobs

            logger.info(f"Successfully scraped {len(jobs)} LinkedIn jobs")
            return jobs[:params.limit]

        except Exception as e:
            logger.error(f"Error searching LinkedIn jobs: {str(e)}")
            raise Exception(f"Failed to search LinkedIn jobs: {str(e)}")

# Factory function for easy usage


async def search_linkedin_jobs(search_params: LinkedInSearchParams) -> List[LinkedInJobPosting]:
    """Convenience function to search LinkedIn jobs"""
    async with LinkedInJobScraper() as scraper:
        return await scraper.search_jobs(search_params)

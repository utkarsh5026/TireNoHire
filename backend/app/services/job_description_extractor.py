import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from fastapi import HTTPException
import trafilatura  # For fallback extraction


class JobDescriptionExtractor:
    def __init__(self):
        # Common headers to avoid being blocked
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        }

        # Configure site-specific extractors
        self.extractors = {
            "linkedin.com": self._extract_linkedin,
            "indeed.com": self._extract_indeed,
            "glassdoor.com": self._extract_glassdoor,
            "monster.com": self._extract_monster,
            # Add more sites as needed
        }

    async def extract_from_url(self, url: str):
        """Main method to extract job description from a URL"""
        try:
            # 1. Identify the site
            domain = self._get_domain(url)

            # 2. Fetch the content
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()

            # 3. Apply site-specific extractor or fallback
            if domain in self.extractors:
                raw_text = self.extractors[domain](response.text, url)
            else:
                raw_text = self._generic_extract(response.text)

            # 4. Return the extracted text
            return raw_text

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error extracting job description: {str(e)}"
            )

    def _get_domain(self, url: str) -> str:
        """Extract the domain from URL"""
        parsed_url = urlparse(url)
        domain = parsed_url.netloc

        # Handle www prefix and extract base domain
        if domain.startswith('www.'):
            domain = domain[4:]

        # Handle subdomains for certain sites
        for known_domain in self.extractors.keys():
            if known_domain in domain:
                return known_domain

        return domain

    def _extract_linkedin(self, html: str, url: str) -> str:
        """LinkedIn-specific extraction logic"""
        soup = BeautifulSoup(html, 'html.parser')

        # LinkedIn job description is typically in a div with specific class
        job_description = soup.find(
            'div', {'class': 'show-more-less-html__markup'})

        # Extract job title
        job_title = soup.find('h1', {'class': 'top-card-layout__title'})

        # Extract company name
        company = soup.find('a', {'class': 'topcard__org-name-link'})

        # Combine extracted content
        content = ""
        if job_title:
            content += f"Job Title: {job_title.get_text(strip=True)}\n\n"
        if company:
            content += f"Company: {company.get_text(strip=True)}\n\n"
        if job_description:
            content += job_description.get_text(separator='\n')

        # If we couldn't extract properly, try alternate selectors or fallback
        if not content.strip():
            # Try alternative LinkedIn selectors (they change frequently)
            job_description = soup.find('div', {'class': 'description__text'})
            if job_description:
                content = job_description.get_text(separator='\n')
            else:
                # Fallback to generic extraction
                content = self._generic_extract(html)

        return content

    def _extract_indeed(self, html: str, url: str) -> str:
        """Indeed-specific extraction logic"""
        soup = BeautifulSoup(html, 'html.parser')

        # Indeed job title
        job_title = soup.find('h1', {'class': 'jobsearch-JobInfoHeader-title'})

        # Indeed company name
        company = soup.find('div', {'class': 'jobsearch-InlineCompanyRating'})

        # Indeed job description
        job_description = soup.find('div', {'id': 'jobDescriptionText'})

        # Combine extracted content
        content = ""
        if job_title:
            content += f"Job Title: {job_title.get_text(strip=True)}\n\n"
        if company:
            content += f"Company: {company.get_text(strip=True)}\n\n"
        if job_description:
            content += job_description.get_text(separator='\n')

        # Fallback if needed
        if not content.strip():
            content = self._generic_extract(html)

        return content

    def _extract_glassdoor(self, html: str, url: str) -> str:
        """Glassdoor-specific extraction logic"""
        soup = BeautifulSoup(html, 'html.parser')

        # Extract job details (Glassdoor specific selectors)
        job_title = soup.find('h1', {'data-test': 'job-title'})
        company = soup.find('div', {'data-test': 'employer-name'})
        job_description = soup.find('div', {'id': 'JobDescriptionContainer'})

        # Combine extracted content
        content = ""
        if job_title:
            content += f"Job Title: {job_title.get_text(strip=True)}\n\n"
        if company:
            content += f"Company: {company.get_text(strip=True)}\n\n"
        if job_description:
            content += job_description.get_text(separator='\n')

        # Fallback if needed
        if not content.strip():
            content = self._generic_extract(html)

        return content

    def _extract_monster(self, html: str, url: str) -> str:
        """Monster-specific extraction logic"""
        soup = BeautifulSoup(html, 'html.parser')

        # Extract job details from Monster
        job_title = soup.find(
            'h1', {'class': 'headerstyle__JobViewHeaderTitle'})
        company = soup.find(
            'div', {'class': 'headerstyle__JobViewHeaderCompany'})
        job_description = soup.find(
            'div', {'class': 'descriptionstyle__DescriptionContainer'})

        # Combine extracted content
        content = ""
        if job_title:
            content += f"Job Title: {job_title.get_text(strip=True)}\n\n"
        if company:
            content += f"Company: {company.get_text(strip=True)}\n\n"
        if job_description:
            content += job_description.get_text(separator='\n')

        # Fallback if needed
        if not content.strip():
            content = self._generic_extract(html)

        return content

    def _generic_extract(self, html: str) -> str:
        """Generic extraction for unsupported sites using trafilatura"""
        # Try trafilatura for main content extraction
        content = trafilatura.extract(html)

        # If trafilatura fails, use a basic approach with BeautifulSoup
        if not content or len(content) < 100:
            soup = BeautifulSoup(html, 'html.parser')

            # Remove unnecessary elements
            for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                tag.decompose()

            # Try to find the main content area (often in a main tag or article tag)
            main_content = soup.find('main') or soup.find('article') or soup.find(
                'div', {'id': re.compile('content|main', re.I)})

            if main_content:
                content = main_content.get_text(separator='\n')
            else:
                # Last resort: get all text
                content = soup.get_text(separator='\n')

            # Clean up whitespace
            content = re.sub(r'\n\s*\n', '\n\n', content)

        return content

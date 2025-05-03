import time
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate, ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type
)
from .models import JobData
from loguru import logger
from .prompt import JOB_DESCRITPTION_EXTRACTION_SYSTEM_PROMPT


class JobDescriptionExtractor:
    def __init__(self, model_name: str = "gpt-4"):
        """🤖 Initialize the job description extractor with LLM models

        Sets up two LLM instances:
        - Main LLM for parsing job descriptions
        - Analysis LLM for more complex reasoning tasks

        Args:
            model_name: The OpenAI model to use (default: "gpt-4")
        """
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=0.1,
            timeout=60,
        )

        self.analysis_llm = ChatOpenAI(
            model=model_name,
            temperature=0.3,
            timeout=120,
        )

        logger.info(f"Initialized LLM service with model: {model_name}")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception)
    )
    async def parse_job_description(self, job_text: str) -> JobData:
        """📝 Extract structured information from job description

        Uses a Pydantic parser to extract key elements:
        - 🏢 Company and job details
        - 🧠 Skills and requirements
        - 📋 Responsibilities
        - 🌟 Preferred qualifications
        - 💰 Benefits

        Args:
            job_text: Raw text of the job description

        Returns:
            Structured JobData object with parsed information

        Note:
            Falls back to alternative parsing method if primary fails
        """
        logger.info("Parsing job description with LLM")

        try:
            parser = PydanticOutputParser(pydantic_object=JobData)
            user_prompt = """Job description:
            {job_text}
            
            {format_instructions}
            """
            chat_prompt = ChatPromptTemplate.from_messages([
                ("system", JOB_DESCRITPTION_EXTRACTION_SYSTEM_PROMPT),
                ("human", user_prompt)
            ])

            formatted_prompt = chat_prompt.format_messages(
                job_text=job_text,
                format_instructions=parser.get_format_instructions()
            )

            start_time = time.time()
            response = await self.llm.agenerate([formatted_prompt])
            end_time = time.time()

            logger.info(
                f"Job parsing completed in {end_time - start_time:.2f} seconds")

            output_text = response.generations[0][0].text
            parsed_result = parser.parse(output_text)

            logger.info(
                f"Successfully parsed job description: extracted {len(parsed_result.requirements)} requirements, {len(parsed_result.responsibilities)} responsibilities")

            return parsed_result
        except Exception as e:
            logger.error(f"Error parsing job description: {str(e)}")
            logger.info("Attempting fallback parsing method")
            return await self._parse_job_description_fallback(job_text)

    async def _parse_job_description_fallback(self, job_text: str) -> JobData:
        """🔄 Fallback method for job description parsing

        Uses a simpler ResponseSchema approach when Pydantic parsing fails:
        - 🧩 Breaks down extraction into simpler components
        - 🛠️ Uses more direct prompting
        - 🦺 Provides basic structure even if parsing partially fails

        Args:
            job_text: Raw text of the job description

        Returns:
            JobData object with best-effort parsed information

        Note:
            Returns minimal JobData with just description if all parsing fails
        """
        response_schemas = [
            ResponseSchema(name="title", description="Job title"),
            ResponseSchema(name="company", description="Company name"),
            ResponseSchema(name="location", description="Job location"),
            ResponseSchema(
                name="type", description="Job type (full-time, part-time, etc.)"),
            ResponseSchema(name="description",
                           description="Full job description"),
            ResponseSchema(name="requirements",
                           description="List of job requirements"),
            ResponseSchema(name="responsibilities",
                           description="List of job responsibilities"),
            ResponseSchema(name="preferred_qualifications",
                           description="List of preferred qualifications"),
            ResponseSchema(name="benefits",
                           description="List of benefits offered")
        ]

        parser = StructuredOutputParser.from_response_schemas(response_schemas)

        template = """
        Extract structured information from the following job description:
        
        {job_text}
        
        {format_instructions}
        """

        prompt = PromptTemplate(
            template=template,
            input_variables=["job_text"],
            partial_variables={
                "format_instructions": parser.get_format_instructions()}
        )

        chain = prompt | self.llm | parser

        try:
            result = await chain.arun(job_text=job_text)
            parsed_result = parser.parse(result)
            logger.info(
                "Successfully parsed job description with fallback method")
            return parsed_result
        except Exception as e:
            logger.error(f"Error in fallback job parsing: {str(e)}")
            return JobData(
                title="Unknown Position",
                company=None,
                description=job_text,
                requirements=[],
                responsibilities=[]
            )

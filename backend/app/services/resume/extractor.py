import time
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain.output_parsers import StructuredOutputParser, ResponseSchema

from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from .models import ResumeData

RESUME_EXTRACTOR_SYSTEM_PROMPT = """You are an expert resume parser with deep experience in HR and recruiting.
            Your task is to extract structured information from a resume.
            Analyze the resume carefully and extract all relevant information.
            
            Parsing guidelines:
            1. Be thorough and extract ALL information present in the resume.
            2. For dates, use the format YYYY-MM or YYYY if month is not specified.
            3. Extract skills mentioned throughout the resume, not just from a skills section.
            4. Infer technical skills from projects and work experience if not explicitly stated.
            5. For contact information, extract everything available.
            6. For education, include degree, field, institution, and dates if available.
            7. For experience, capture company, position, dates, and key achievements.
            
            The output should be a valid JSON object that matches the specified schema.
            """


class ResumeExtractor:
    def __init__(self, model_name: str = "gpt-4o-mini"):
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=0.1,
            request_timeout=60,
        )

        logger.info(f"Initialized LLM service with model: {model_name}")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception)
    )
    async def parse_resume(self, resume_text: str) -> ResumeData:
        """Extract structured information from resume text using Pydantic parser"""
        logger.info("Parsing resume with LLM")

        try:
            parser = PydanticOutputParser(pydantic_object=ResumeData)
            user_prompt = """Resume text:
            {resume_text}
            
            {format_instructions}
            """

            chat_prompt = ChatPromptTemplate.from_messages([
                ("system", RESUME_EXTRACTOR_SYSTEM_PROMPT),
                ("human", user_prompt)
            ])

            formatted_prompt = chat_prompt.format_messages(
                resume_text=resume_text,
                format_instructions=parser.get_format_instructions()
            )

            start_time = time.time()
            response = await self.llm.agenerate([formatted_prompt])
            end_time = time.time()

            logger.info(
                f"Resume parsing completed in {end_time - start_time:.2f} seconds")

            output_text = response.generations[0][0].text
            parsed_result = parser.parse(output_text)
            logger.info(
                f"Successfully parsed resume: extracted {len(parsed_result.skills)} skills, {len(parsed_result.experience)} experiences")

            return parsed_result
        except Exception as e:
            logger.error(f"Error parsing resume: {str(e)}")
            return await self._parse_resume_fallback(resume_text)

    async def _parse_resume_fallback(self, resume_text: str) -> ResumeData:
        """Fallback method for resume parsing using ResponseSchema"""
        response_schemas = [
            ResponseSchema(
                name="contact_info", description="Contact information including name, email, phone, location"),
            ResponseSchema(
                name="summary", description="Professional summary or objective"),
            ResponseSchema(
                name="education", description="List of education entries with institution, degree, dates"),
            ResponseSchema(
                name="experience", description="List of work experience with company, position, dates, description"),
            ResponseSchema(
                name="skills", description="List of skills mentioned in the resume"),
            ResponseSchema(name="certifications",
                           description="List of certifications if any"),
            ResponseSchema(name="projects",
                           description="List of projects if any"),
            ResponseSchema(name="languages",
                           description="List of languages spoken if any")
        ]

        parser = StructuredOutputParser.from_response_schemas(response_schemas)

        template = """
        Extract structured information from the following resume:
        
        {resume_text}
        
        {format_instructions}
        """

        prompt = PromptTemplate(
            template=template,
            input_variables=["resume_text"],
            partial_variables={
                "format_instructions": parser.get_format_instructions()}
        )

        chain = prompt | self.llm | parser

        try:
            result = await chain.arun(resume_text=resume_text)
            parsed_result = parser.parse(result)
            logger.info("Successfully parsed resume with fallback method")
            return parsed_result
        except Exception as e:
            logger.error(f"Error in fallback resume parsing: {str(e)}")
            return ResumeData(
                contact_info={},
                education=[],
                experience=[],
                skills=[],
                certifications=[],
                projects=[]
            )

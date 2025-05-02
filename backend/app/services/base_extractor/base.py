import time
from typing import TypeVar
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from loguru import logger

# Define a generic type variable for Pydantic models
T = TypeVar('T')


class BaseExtractor:
    def __init__(self, model_name: str = "gpt-4o-mini"):
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=0.1,
            request_timeout=60,
        )

        logger.info(f"Initialized LLM service with model: {model_name}")

    async def generate_pydantic_result(self, parser: PydanticOutputParser[T], system_prompt: str, user_prompt: str, format_kwargs: dict = {}) -> T:
        """Generate a result using a Pydantic parser and a prompt"""
        try:
            chat_prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", user_prompt)
            ])

            formatted_prompt = chat_prompt.format_messages(**format_kwargs)
            start_time = time.time()
            response = await self.llm.agenerate([formatted_prompt])
            end_time = time.time()

            logger.info(
                f"LLM completed in {end_time - start_time:.2f} seconds")

            output_text = response.generations[0][0].text
            parsed_result = parser.parse(output_text)
            return parsed_result
        except Exception as e:
            logger.error(f"Error generating Pydantic result: {str(e)}")
            raise e

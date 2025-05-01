from io import BytesIO
import requests
import PyPDF2
import docx
from fastapi import UploadFile, HTTPException


class DocumentProcessor:
    @staticmethod
    async def extract_text_from_file(file: UploadFile) -> str:
        """Extract text from an uploaded file (PDF or DOCX)"""
        filename = file.filename.lower()
        content = await file.read()

        if filename.endswith('.pdf'):
            return DocumentProcessor._extract_from_pdf(content)
        elif filename.endswith('.docx'):
            return DocumentProcessor._extract_from_docx(content)
        elif filename.endswith('.doc'):
            raise HTTPException(
                status_code=400, detail="DOC format not supported. Please convert to DOCX or PDF.")
        else:
            raise HTTPException(
                status_code=400, detail="Unsupported file format")

    @staticmethod
    def _extract_from_pdf(content: bytes) -> str:
        """Extract text from PDF file content"""
        text = ""
        try:
            with BytesIO(content) as pdf_file:
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error processing PDF: {str(e)}")

    @staticmethod
    def _extract_from_docx(content: bytes) -> str:
        """Extract text from DOCX file content"""
        try:
            with BytesIO(content) as docx_file:
                doc = docx.Document(docx_file)
                text = "\n".join([para.text for para in doc.paragraphs])
            return text
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error processing DOCX: {str(e)}")

    @staticmethod
    async def extract_text_from_url(url: str) -> str:
        """Extract text from a URL (assuming it points to a PDF or DOCX)"""
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()

            content_type = response.headers.get('Content-Type', '')
            content = response.content

            if 'application/pdf' in content_type:
                return DocumentProcessor._extract_from_pdf(content)
            elif 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' in content_type:
                return DocumentProcessor._extract_from_docx(content)
            else:
                # For web pages, you could use BeautifulSoup to extract text
                raise HTTPException(
                    status_code=400, detail="URL does not point to a supported document type")
        except requests.RequestException as e:
            raise HTTPException(
                status_code=500, detail=f"Error fetching document from URL: {str(e)}")

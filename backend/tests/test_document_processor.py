import pytest
import io
from fastapi import UploadFile, HTTPException
services.document_processor import DocumentProcessor


@pytest.mark.asyncio
async def test_extract_text_from_pdf_file():
    # Create a mock PDF file (just for testing, not a real PDF)
    file_content = b"%PDF-1.5\nThis is a test PDF content"
    file = UploadFile(filename="test.pdf", file=io.BytesIO(file_content))

    # Mock the PDF extraction to return a predefined text
    original_extract = DocumentProcessor._extract_from_pdf

    try:
        DocumentProcessor._extract_from_pdf = lambda content: "Extracted PDF text"

        # Test the extraction
        result = await DocumentProcessor.extract_text_from_file(file)
        assert result == "Extracted PDF text"

    finally:
        # Restore the original method
        DocumentProcessor._extract_from_pdf = original_extract


@pytest.mark.asyncio
async def test_extract_text_from_docx_file():
    # Create a mock DOCX file (just for testing, not a real DOCX)
    # Minimal DOCX header
    file_content = b"PK\x03\x04\x14\x00\x00\x00\x00\x00\x00\x00\x00\x00"
    file = UploadFile(filename="test.docx", file=io.BytesIO(file_content))

    # Mock the DOCX extraction to return a predefined text
    original_extract = DocumentProcessor._extract_from_docx

    try:
        DocumentProcessor._extract_from_docx = lambda content: "Extracted DOCX text"

        # Test the extraction
        result = await DocumentProcessor.extract_text_from_file(file)
        assert result == "Extracted DOCX text"

    finally:
        # Restore the original method
        DocumentProcessor._extract_from_docx = original_extract


@pytest.mark.asyncio
async def test_extract_text_from_unsupported_file():
    # Create a mock TXT file
    file_content = b"This is a plain text file"
    file = UploadFile(filename="test.txt", file=io.BytesIO(file_content))

    # Test that an exception is raised for unsupported file types
    with pytest.raises(HTTPException) as excinfo:
        await DocumentProcessor.extract_text_from_file(file)

    assert excinfo.value.status_code == 400
    assert "Unsupported file format" in str(excinfo.value.detail)


@pytest.mark.asyncio
async def test_extract_text_from_doc_file():
    # Create a mock DOC file
    file_content = b"This is a DOC file"
    file = UploadFile(filename="test.doc", file=io.BytesIO(file_content))

    # Test that an exception is raised for DOC files (which we don't support)
    with pytest.raises(HTTPException) as excinfo:
        await DocumentProcessor.extract_text_from_file(file)

    assert excinfo.value.status_code == 400
    assert "DOC format not supported" in str(excinfo.value.detail)

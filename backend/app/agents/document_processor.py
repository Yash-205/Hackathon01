import pdfplumber
import io
import pytesseract
from PIL import Image
from typing import Dict, Any, List

class DocumentProcessor:
    @staticmethod
    def process_pdf(file_content: bytes) -> Dict[str, Any]:
        """Extract text from PDF using pdfplumber."""
        text = ""
        page_count = 0
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                page_count = len(pdf.pages)
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"Error processing PDF: {e}")
            raise e
        
        return {
            "text": text.strip(),
            "page_count": page_count,
            "format": "pdf"
        }

    @staticmethod
    def process_image(file_content: bytes) -> Dict[str, Any]:
        """Extract text from Image using Tesseract OCR."""
        text = ""
        try:
            img = Image.open(io.BytesIO(file_content))
            text = pytesseract.image_to_string(img)
        except Exception as e:
            print(f"Error processing image: {e}")
            raise e
            
        return {
            "text": text.strip(),
            "format": "image"
        }

    @staticmethod
    def process_text(file_content: bytes) -> Dict[str, Any]:
        """Process plain text files."""
        return {
            "text": file_content.decode("utf-8", errors="ignore").strip(),
            "format": "text"
        }

    def process(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        ext = filename.split(".")[-1].lower()
        if ext == "pdf":
            return self.process_pdf(file_content)
        elif ext in ["jpg", "jpeg", "png", "bmp"]:
            return self.process_image(file_content)
        else:
            return self.process_text(file_content)

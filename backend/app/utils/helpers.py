import random
import string
from io import BytesIO
import pypdf
from sqlalchemy.orm import Session
from app.models import Order


def generate_unique_order_id(db: Session) -> str:
    """Generate a clean, memorable order ID like SX-4829 or SX-9214.
    If the shop has high volume, it expands cleanly while staying easy
    for customers to read aloud at the shop counter.
    """
    for _ in range(100):
        # 4 digit random number
        num = random.randint(1000, 9999)
        candidate = f"SX-{num}"
        existing = db.query(Order).filter(Order.order_id == candidate).first()
        if not existing:
            return candidate
            
    # Fallback to alphanumeric if 4 digits are densely populated
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"SX-{suffix}"


def inspect_pdf_pages(file_bytes: bytes) -> int:
    """Inspect the page count of an uploaded PDF file safely."""
    try:
        reader = pypdf.PdfReader(BytesIO(file_bytes))
        count = len(reader.pages)
        return max(1, count)
    except Exception:
        return 1

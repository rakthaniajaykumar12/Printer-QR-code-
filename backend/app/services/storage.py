import os
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Order


ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/x-png"
}
MAX_FILE_SIZE_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


def validate_file(file: UploadFile) -> str:
    """Validate extension and MIME type. Returns sanitized extension."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload"
        )
    
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type (.{ext}). Allowed formats: PDF, JPG, JPEG, PNG"
        )
    
    # Check MIME type if provided
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        # Some mobile browsers report generic octet-stream for PDFs
        if not (file.content_type == "application/octet-stream" and ext == "pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid MIME content type: {file.content_type}"
            )
            
    return ext


async def save_uploaded_file(file: UploadFile, ext: str) -> tuple[str, bytes, int]:
    """Read file content with strict size checking and save to private storage with a unique UUID."""
    content = await file.read()
    file_size = len(content)

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB} MB"
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty"
        )

    # Secure unique filename
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    target_path = Path(settings.UPLOAD_DIR) / unique_name

    with open(target_path, "wb") as f:
        f.write(content)

    return unique_name, content, file_size


def get_file_path(stored_filename: str) -> Path:
    """Resolve and verify absolute file path inside uploads folder."""
    # Prevent directory traversal
    safe_name = os.path.basename(stored_filename)
    path = Path(settings.UPLOAD_DIR) / safe_name
    if not path.exists() or not path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or has been cleaned up due to retention policy"
        )
    return path


def cleanup_expired_files(db: Session, retention_hours: int = None) -> int:
    """Delete files older than the retention threshold to protect customer privacy and conserve disk space."""
    if retention_hours is None:
        retention_hours = settings.FILE_RETENTION_HOURS

    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=retention_hours)
    
    # Find orders older than cutoff where file is not yet marked deleted
    expired_orders = db.query(Order).filter(
        Order.created_at < cutoff_time,
        Order.is_file_deleted == False
    ).all()

    cleaned_count = 0
    for order in expired_orders:
        try:
            file_path = Path(settings.UPLOAD_DIR) / order.stored_filename
            if file_path.exists() and file_path.is_file():
                file_path.unlink()
            order.is_file_deleted = True
            cleaned_count += 1
        except Exception as e:
            # Continue on error
            pass
            
    if cleaned_count > 0:
        db.commit()

    return cleaned_count

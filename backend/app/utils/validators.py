import re
from fastapi import HTTPException

SAFE_ID_REGEX = re.compile(r"^[a-zA-Z0-9_\-]+$")
ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json"}

def validate_dataset_id(dataset_id: str) -> str:
    if not dataset_id or not SAFE_ID_REGEX.match(dataset_id):
        raise HTTPException(status_code=400, detail="Invalid dataset ID format.")
    return dataset_id

def validate_filename(filename: str) -> str:
    if not filename or ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid or unsafe filename.")
    return filename

def validate_extension(filename: str) -> str:
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: CSV, XLSX, JSON."
        )
    return ext

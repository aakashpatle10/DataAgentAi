import io
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from typing import List

from app.schemas.cleaning import (
    TransformationStep, TransformationPreviewResponse, TransformationHistoryItem
)
from app.services.cleaning_service import cleaning_service
from app.services.dataset_service import dataset_service

router = APIRouter()

@router.post("/{dataset_id}/transformations/preview", response_model=TransformationPreviewResponse)
def preview_transformation(dataset_id: str, step: TransformationStep):
    return cleaning_service.preview_transformation(dataset_id, step)

@router.post("/{dataset_id}/transformations", response_model=TransformationHistoryItem)
def apply_transformation(dataset_id: str, step: TransformationStep):
    return cleaning_service.apply_transformation(dataset_id, step)

@router.get("/{dataset_id}/transformations", response_model=List[TransformationHistoryItem])
def get_transformations(dataset_id: str):
    return cleaning_service.get_history(dataset_id)

@router.post("/{dataset_id}/undo")
def undo_transformation(dataset_id: str):
    return cleaning_service.undo_last_transformation(dataset_id)

@router.post("/{dataset_id}/reset")
def reset_dataset(dataset_id: str):
    return cleaning_service.reset_dataset(dataset_id)

@router.get("/{dataset_id}/export")
def export_dataset(dataset_id: str, format: str = Query("csv", pattern="^(csv|xlsx|json)$")):
    df = dataset_service.load_active_df(dataset_id)
    fmt = format.lower()
    
    if fmt == "csv":
        buf = io.StringIO()
        df.to_csv(buf, index=False)
        buf.seek(0)
        return StreamingResponse(
            iter([buf.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=cleaned_{dataset_id}.csv"}
        )
    elif fmt == "xlsx":
        buf = io.BytesIO()
        df.to_excel(buf, index=False, engine="openpyxl")
        buf.seek(0)
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=cleaned_{dataset_id}.xlsx"}
        )
    else:  # json
        buf = io.StringIO()
        df.to_json(buf, orient="records", indent=2)
        buf.seek(0)
        return StreamingResponse(
            iter([buf.getvalue()]),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=cleaned_{dataset_id}.json"}
        )

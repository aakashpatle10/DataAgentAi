from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from typing import List

from app.schemas.dataset import DatasetMeta, DatasetPreviewResponse, ColumnSchema
from app.services.dataset_service import dataset_service
from app.repositories.dataset_repository import repository

router = APIRouter()

@router.post("/upload", response_model=DatasetPreviewResponse)
async def upload_dataset(file: UploadFile = File(...)):
    return await dataset_service.save_uploaded_file(file)

@router.post("/demo", response_model=DatasetPreviewResponse)
def load_demo():
    return dataset_service.load_demo_dataset()

@router.get("", response_model=List[DatasetMeta])
def list_datasets():
    metas = repository.list_datasets()
    return [DatasetMeta(**m) for m in metas]

@router.get("/{dataset_id}", response_model=DatasetMeta)
def get_dataset(dataset_id: str):
    meta = repository.get_dataset_meta(dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return DatasetMeta(**meta)

@router.delete("/{dataset_id}")
def delete_dataset(dataset_id: str):
    deleted = dataset_service.delete_dataset(dataset_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return {"message": "Dataset successfully deleted."}

@router.get("/{dataset_id}/preview", response_model=DatasetPreviewResponse)
def get_preview(dataset_id: str):
    df = dataset_service.load_active_df(dataset_id)
    meta = repository.get_dataset_meta(dataset_id)
    cols = dataset_service.get_column_schemas(df)
    preview_rows = df.head(10).to_dict(orient="records")
    return DatasetPreviewResponse(
        metadata=DatasetMeta(**meta),
        columns=cols,
        preview_rows=preview_rows
    )

@router.get("/{dataset_id}/schema", response_model=List[ColumnSchema])
def get_schema(dataset_id: str):
    df = dataset_service.load_active_df(dataset_id)
    return dataset_service.get_column_schemas(df)

@router.get("/{dataset_id}/dashboard-summary")
def get_dashboard_summary(dataset_id: str):
    return dataset_service.get_dashboard_summary(dataset_id)

@router.get("/{dataset_id}/export")
def export_dataset_csv(dataset_id: str):
    meta = repository.get_dataset_meta(dataset_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    df = dataset_service.load_active_df(dataset_id)
    csv_str = df.to_csv(index=False)
    filename = f"{meta.get('name', 'dataset').replace(' ', '_').lower()}_clean.csv"
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

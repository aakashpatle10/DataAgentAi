import base64
from fastapi import APIRouter, HTTPException, Response
from app.schemas.reports import ReportGenerateRequest, ReportMeta
from app.services.report_service import report_service
from app.repositories.dataset_repository import repository

router = APIRouter()

@router.post("/{dataset_id}/reports", response_model=ReportMeta)
def generate_report(dataset_id: str, req: ReportGenerateRequest):
    return report_service.generate_pdf_report(dataset_id, req)

@router.get("/reports/{report_id}", response_model=ReportMeta)
def get_report_meta(report_id: str):
    meta = repository.get_report(report_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Report not found.")
    clean_meta = {k: v for k, v in meta.items() if k != "pdf_base64"}
    return ReportMeta(**clean_meta)

@router.get("/reports/{report_id}/download")
def download_report(report_id: str):
    meta = repository.get_report(report_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Report not found.")
    
    pdf_base64 = meta.get("pdf_base64")
    if not pdf_base64:
        raise HTTPException(status_code=404, detail="Report content not found in database.")
        
    pdf_bytes = base64.b64decode(pdf_base64)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{report_id}.pdf"'}
    )

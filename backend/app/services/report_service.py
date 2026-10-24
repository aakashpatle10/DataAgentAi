import io
import base64
import os
import uuid
from datetime import datetime
from typing import Dict, Any
from fastapi import HTTPException

from app.config import settings
from app.schemas.reports import ReportGenerateRequest, ReportMeta
from app.services.dataset_service import dataset_service
from app.services.profiling_service import profiling_service
from app.services.statistics_service import statistics_service
from app.repositories.dataset_repository import repository

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

class ReportService:
    def generate_pdf_report(self, dataset_id: str, req: ReportGenerateRequest) -> ReportMeta:
        meta = repository.get_dataset_meta(dataset_id)
        if not meta:
            raise HTTPException(status_code=404, detail="Dataset not found.")
            
        profile = profiling_service.profile_dataset(dataset_id)
        desc_stats = statistics_service.get_descriptive_stats(dataset_id)
        corrs = statistics_service.get_correlations(dataset_id) if profile.numeric_columns_count >= 2 else None
        tx_history = repository.get_transformations(dataset_id)

        report_id = f"rep_{uuid.uuid4().hex[:10]}"
        pdf_buffer = io.BytesIO()

        if REPORTLAB_AVAILABLE:
            doc = SimpleDocTemplate(
                pdf_buffer,
                pagesize=letter,
                rightMargin=40, leftMargin=40,
                topMargin=40, bottomMargin=40
            )
            styles = getSampleStyleSheet()
            
            # Custom professional typography styles
            title_style = ParagraphStyle(
                "RepTitle", parent=styles["Title"],
                fontName="Helvetica-Bold", fontSize=22, leading=26,
                textColor=colors.HexColor("#1e1b4b"), alignment=0
            )
            h1_style = ParagraphStyle(
                "RepH1", parent=styles["Heading1"],
                fontName="Helvetica-Bold", fontSize=14, leading=18,
                textColor=colors.HexColor("#4338ca"), spaceBefore=14, spaceAfter=8
            )
            body_style = ParagraphStyle(
                "RepBody", parent=styles["Normal"],
                fontName="Helvetica", fontSize=9.5, leading=13,
                textColor=colors.HexColor("#334155")
            )
            caption_style = ParagraphStyle(
                "RepCap", parent=styles["Normal"],
                fontName="Helvetica-Oblique", fontSize=8, leading=10,
                textColor=colors.HexColor("#64748b")
            )

            story = []
            
            # Title & Metadata
            story.append(Paragraph(req.title or "DataAgent AI — Comprehensive Analytics Report", title_style))
            story.append(Spacer(1, 4))
            gen_time = datetime.now().strftime("%B %d, %Y - %H:%M UTC")
            story.append(Paragraph(f"Dataset: <b>{meta.get('name')}</b> | Generated: {gen_time} | Platform: DataAgent AI", caption_style))
            story.append(Spacer(1, 14))

            # 1. Dataset Overview
            if req.include_overview:
                story.append(Paragraph("1. Executive Dataset Overview", h1_style))
                overview_data = [
                    ["Metric", "Value", "Metric", "Value"],
                    ["Total Rows", f"{profile.total_rows:,}", "Total Columns", f"{profile.total_columns}"],
                    ["Total Cells", f"{profile.total_cells:,}", "Memory Footprint", f"{profile.memory_usage_kb} KB"],
                    ["Duplicate Rows", f"{profile.duplicate_rows_count} ({profile.duplicate_rows_percentage}%)", "Missing Cells", f"{profile.missing_cells_count} ({profile.missing_cells_percentage}%)"],
                    ["Numeric Columns", f"{profile.numeric_columns_count}", "Categorical Columns", f"{profile.categorical_columns_count}"],
                    ["Quality Score", f"{profile.quality_score} / 100", "File Format", meta.get("file_format", "csv").upper()]
                ]
                t_overview = Table(overview_data, colWidths=[130, 130, 130, 130])
                t_overview.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0e7ff")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#3730a3")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ]))
                story.append(t_overview)
                story.append(Spacer(1, 12))

            # 2. Data Quality Audit
            if req.include_quality:
                story.append(Paragraph("2. Data Quality & Integrity Diagnostics", h1_style))
                if profile.quality_issues:
                    q_rows = [["Severity", "Category", "Column", "Details"]]
                    for issue in profile.quality_issues[:8]:
                        q_rows.append([
                            issue.severity.upper(),
                            issue.category.replace("_", " ").title(),
                            issue.column or "Dataset-level",
                            issue.description
                        ])
                    t_quality = Table(q_rows, colWidths=[65, 95, 95, 265])
                    t_quality.setStyle(TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                        ("FONTSIZE", (0, 0), (-1, -1), 8),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                        ("TOPPADDING", (0, 0), (-1, -1), 3),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                    ]))
                    story.append(t_quality)
                else:
                    story.append(Paragraph("No critical data quality issues or anomalies detected. Data exhibits high integrity.", body_style))
                story.append(Spacer(1, 12))

            # 3. Key Descriptive Statistics
            if req.include_descriptive_stats and desc_stats:
                story.append(Paragraph("3. Descriptive Statistics Summary", h1_style))
                stat_rows = [["Column", "Count", "Mean", "Std Dev", "Min", "Median", "Max"]]
                for item in desc_stats[:7]:
                    stat_rows.append([
                        item.column,
                        str(item.count),
                        str(item.mean if item.mean is not None else "-"),
                        str(item.std if item.std is not None else "-"),
                        str(item.min if item.min is not None else "-"),
                        str(item.median if item.median is not None else "-"),
                        str(item.max if item.max is not None else "-")
                    ])
                t_stats = Table(stat_rows, colWidths=[120, 60, 70, 70, 65, 65, 70])
                t_stats.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0e7ff")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]))
                story.append(t_stats)
                story.append(Spacer(1, 12))

            # 4. Correlation Highlights
            if req.include_correlations and corrs and corrs.top_correlations:
                story.append(Paragraph("4. Statistical Correlation Highlights", h1_style))
                corr_rows = [["Feature X", "Feature Y", "Pearson r", "Classification"]]
                for p in corrs.top_correlations[:6]:
                    corr_rows.append([p.column_x, p.column_y, str(p.pearson_r), p.relationship])
                t_corr = Table(corr_rows, colWidths=[140, 140, 80, 160])
                t_corr.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ]))
                story.append(t_corr)
                story.append(Spacer(1, 4))
                story.append(Paragraph("<i>Caution: Statistical correlation indicates mathematical association and does not demonstrate causal relationships.</i>", caption_style))
                story.append(Spacer(1, 12))

            # 5. Cleaning Audit Trail
            if req.include_transformations:
                story.append(Paragraph("5. Transformation & Cleaning Audit Trail", h1_style))
                if tx_history:
                    tx_rows = [["Timestamp", "Operation", "Details", "Rows Before / After"]]
                    for tx in tx_history:
                        tx_rows.append([
                            tx.get("timestamp", "")[:19].replace("T", " "),
                            tx.get("operation", "").replace("_", " ").title(),
                            tx.get("description", ""),
                            f"{tx.get('rows_before')} -> {tx.get('rows_after')}"
                        ])
                    t_tx = Table(tx_rows, colWidths=[105, 95, 230, 90])
                    t_tx.setStyle(TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
                        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                        ("TOPPADDING", (0, 0), (-1, -1), 3),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                    ]))
                    story.append(t_tx)
                else:
                    story.append(Paragraph("Original dataset analyzed without modifications.", body_style))
                story.append(Spacer(1, 14))

            # Caveats and limitations footer
            story.append(Spacer(1, 10))
            story.append(Paragraph("<b>Analytical Caveats & Limitations:</b> All metrics are computed deterministically via Pandas/NumPy. Outliers identified using Tukey's IQR rule are statistical candidates, not verified measurement errors.", caption_style))

            doc.build(story)
        else:
            pdf_buffer.write(f"DataAgent AI Report\nDataset: {meta.get('name')}\nTotal Rows: {profile.total_rows}\nTotal Columns: {profile.total_columns}".encode("utf-8"))

        pdf_bytes = pdf_buffer.getvalue()
        pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
        file_size = len(pdf_bytes)

        report_meta = {
            "id": report_id,
            "dataset_id": dataset_id,
            "title": req.title or "DataAgent AI Comprehensive Analysis Report",
            "file_format": "pdf",
            "file_size_bytes": file_size,
            "created_at": datetime.utcnow().isoformat(),
            "download_url": f"/api/reports/{report_id}/download",
            "pdf_base64": pdf_base64
        }
        repository.save_report(report_meta)

        clean_meta = {k: v for k, v in report_meta.items() if k != "pdf_base64"}
        return ReportMeta(**clean_meta)

report_service = ReportService()

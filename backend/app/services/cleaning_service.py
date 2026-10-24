import uuid
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
from fastapi import HTTPException

from app.schemas.cleaning import (
    TransformationStep, TransformationPreviewResponse, TransformationHistoryItem
)
from app.services.dataset_service import dataset_service
from app.repositories.dataset_repository import repository
from app.utils.serializer import clean_record_dict

class CleaningService:
    def apply_operation_to_df(self, df: pd.DataFrame, step: TransformationStep) -> Tuple[pd.DataFrame, str]:
        op = step.operation.lower()
        p = step.parameters
        desc = step.description or ""
        df = df.copy()

        if op == "remove_duplicates":
            subset = p.get("columns")
            keep = p.get("keep", "first")
            before = len(df)
            df = df.drop_duplicates(subset=subset if subset else None, keep=keep)
            diff = before - len(df)
            desc = desc or f"Removed {diff} duplicate row(s)."

        elif op == "drop_columns":
            cols = p.get("columns", [])
            valid_cols = [c for c in cols if c in df.columns]
            if not valid_cols:
                raise HTTPException(status_code=400, detail="None of the specified columns exist in dataset.")
            df = df.drop(columns=valid_cols)
            desc = desc or f"Dropped {len(valid_cols)} column(s): {', '.join(valid_cols)}."

        elif op == "rename_column":
            old_name = p.get("old_name")
            new_name = p.get("new_name")
            if not old_name or not new_name or old_name not in df.columns:
                raise HTTPException(status_code=400, detail=f"Column '{old_name}' not found for renaming.")
            df = df.rename(columns={old_name: new_name})
            desc = desc or f"Renamed column '{old_name}' to '{new_name}'."

        elif op == "cast_type":
            col = p.get("column")
            target_type = p.get("target_type", "").lower()
            if not col or col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Column '{col}' not found.")
            
            try:
                if target_type in ["int", "integer"]:
                    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)
                elif target_type in ["float", "numeric"]:
                    df[col] = pd.to_numeric(df[col], errors="coerce").astype(float)
                elif target_type in ["str", "string", "text"]:
                    df[col] = df[col].astype(str)
                elif target_type in ["datetime", "date"]:
                    df[col] = pd.to_datetime(df[col], errors="coerce")
                elif target_type in ["bool", "boolean"]:
                    df[col] = df[col].astype(bool)
                else:
                    raise HTTPException(status_code=400, detail=f"Unsupported cast target '{target_type}'.")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to cast column '{col}' to {target_type}: {str(e)}")
            desc = desc or f"Casted column '{col}' to {target_type}."

        elif op == "impute_missing":
            col = p.get("column")
            strategy = p.get("strategy", "").lower()
            if not col or col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Column '{col}' not found.")
            
            s = df[col]
            null_count = int(s.isna().sum())
            if null_count == 0:
                desc = desc or f"No missing values in '{col}'."
                return df, desc

            if strategy == "drop_rows":
                df = df.dropna(subset=[col])
                desc = desc or f"Dropped {null_count} row(s) with missing values in '{col}'."
            elif strategy == "drop_column":
                df = df.drop(columns=[col])
                desc = desc or f"Dropped column '{col}' containing {null_count} missing values."
            elif strategy == "mean":
                mean_val = pd.to_numeric(s, errors="coerce").mean()
                df[col] = df[col].fillna(round(mean_val, 2))
                desc = desc or f"Imputed {null_count} missing value(s) in '{col}' using mean ({round(mean_val, 2)})."
            elif strategy == "median":
                median_val = pd.to_numeric(s, errors="coerce").median()
                df[col] = df[col].fillna(round(median_val, 2))
                desc = desc or f"Imputed {null_count} missing value(s) in '{col}' using median ({round(median_val, 2)})."
            elif strategy == "mode":
                mode_val = s.mode()
                fill = mode_val.iloc[0] if len(mode_val) > 0 else "Unknown"
                df[col] = df[col].fillna(fill)
                desc = desc or f"Imputed {null_count} missing value(s) in '{col}' using mode ('{fill}')."
            elif strategy == "constant":
                fill = p.get("fill_value", "Unknown")
                df[col] = df[col].fillna(fill)
                desc = desc or f"Filled {null_count} missing value(s) in '{col}' with '{fill}'."
            else:
                raise HTTPException(status_code=400, detail=f"Unknown imputation strategy '{strategy}'.")

        elif op == "trim_whitespace":
            cols = p.get("columns") or [c for c in df.columns if df[c].dtype == object]
            valid_cols = [c for c in cols if c in df.columns]
            for c in valid_cols:
                df[c] = df[c].apply(lambda x: x.strip() if isinstance(x, str) else x)
            desc = desc or f"Trimmed whitespace in {len(valid_cols)} text column(s)."

        elif op == "normalize_categorical":
            col = p.get("column")
            if not col or col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Column '{col}' not found.")
            df[col] = df[col].apply(lambda x: x.strip().title() if isinstance(x, str) else x)
            desc = desc or f"Normalized categorical values in column '{col}' to title case."

        elif op == "filter_rows":
            col = p.get("column")
            condition = p.get("operator", "equals").lower()
            val = p.get("value")
            if not col or col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Column '{col}' not found.")
            
            before = len(df)
            s = df[col]
            if condition == "equals":
                df = df[s.astype(str) == str(val)]
            elif condition == "not_equals":
                df = df[s.astype(str) != str(val)]
            elif condition == "contains":
                df = df[s.astype(str).str.contains(str(val), na=False)]
            elif condition in ["gt", "gte", "lt", "lte"]:
                num_s = pd.to_numeric(s, errors="coerce")
                num_val = float(val)
                if condition == "gt":
                    df = df[num_s > num_val]
                elif condition == "gte":
                    df = df[num_s >= num_val]
                elif condition == "lt":
                    df = df[num_s < num_val]
                elif condition == "lte":
                    df = df[num_s <= num_val]
            diff = before - len(df)
            desc = desc or f"Filtered rows by '{col} {condition} {val}', removed {diff} rows."

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported operation '{op}'.")

        return df, desc

    def preview_transformation(self, dataset_id: str, step: TransformationStep) -> TransformationPreviewResponse:
        df = dataset_service.load_active_df(dataset_id)
        orig_rows = len(df)
        orig_cols = len(df.columns)
        
        transformed_df, desc = self.apply_operation_to_df(df, step)
        
        affected_count = abs(orig_rows - len(transformed_df))
        
        return TransformationPreviewResponse(
            operation=step.operation,
            original_rows=orig_rows,
            original_cols=orig_cols,
            preview_rows=len(transformed_df),
            preview_cols=len(transformed_df.columns),
            affected_rows_count=affected_count,
            sample_before=[clean_record_dict(r) for r in df.head(5).to_dict(orient="records")],
            sample_after=[clean_record_dict(r) for r in transformed_df.head(5).to_dict(orient="records")]
        )

    def apply_transformation(self, dataset_id: str, step: TransformationStep) -> TransformationHistoryItem:
        df = dataset_service.load_active_df(dataset_id)
        rows_before = len(df)
        cols_before = len(df.columns)
        
        transformed_df, desc = self.apply_operation_to_df(df, step)
        
        dataset_service.save_active_df(dataset_id, transformed_df)
        
        history_item = {
            "id": f"tx_{uuid.uuid4().hex[:8]}",
            "dataset_id": dataset_id,
            "operation": step.operation,
            "parameters": step.parameters,
            "description": desc,
            "rows_before": rows_before,
            "rows_after": len(transformed_df),
            "cols_before": cols_before,
            "cols_after": len(transformed_df.columns)
        }
        repository.add_transformation(dataset_id, history_item)
        return TransformationHistoryItem(**history_item)

    def get_history(self, dataset_id: str) -> List[TransformationHistoryItem]:
        items = repository.get_transformations(dataset_id)
        return [TransformationHistoryItem(**item) for item in items]

    def undo_last_transformation(self, dataset_id: str):
        history = repository.get_transformations(dataset_id)
        if not history:
            raise HTTPException(status_code=400, detail="No transformations to undo.")
        
        orig_records = repository.get_dataset_records(dataset_id, is_original=True)
        if not orig_records:
            raise HTTPException(status_code=404, detail="Original dataset records not found in database.")
        df = pd.DataFrame(orig_records)

        popped = repository.pop_last_transformation(dataset_id)
        remaining_history = repository.get_transformations(dataset_id)
        
        for item in remaining_history:
            step = TransformationStep(
                operation=item["operation"],
                parameters=item["parameters"],
                description=item.get("description", "")
            )
            df, _ = self.apply_operation_to_df(df, step)

        dataset_service.save_active_df(dataset_id, df)
        return {"message": f"Successfully reverted: {popped.get('description', '')}" if popped else "Reverted."}

    def reset_dataset(self, dataset_id: str):
        meta = repository.get_dataset_meta(dataset_id)
        if not meta:
            raise HTTPException(status_code=404, detail="Dataset not found.")
        orig_records = repository.get_dataset_records(dataset_id, is_original=True)
        if not orig_records:
            raise HTTPException(status_code=404, detail="Original dataset records not found in database.")
        df = pd.DataFrame(orig_records)

        dataset_service.save_active_df(dataset_id, df)
        repository.clear_transformations(dataset_id)
        return {"message": "Dataset successfully reset to original uploaded state."}

cleaning_service = CleaningService()

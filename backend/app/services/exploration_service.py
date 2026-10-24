import math
import pandas as pd
from typing import List, Dict, Any
from fastapi import HTTPException

from app.schemas.exploration import QueryRequest, QueryResponse, ColumnFilter
from app.services.dataset_service import dataset_service
from app.utils.serializer import clean_record_dict

class ExplorationService:
    def query_dataset(self, dataset_id: str, req: QueryRequest) -> QueryResponse:
        df = dataset_service.load_active_df(dataset_id)
        total_rows = len(df)
        
        # 1. Global Search (across string / text / categorical columns)
        if req.search and req.search.strip():
            term = req.search.strip().lower()
            mask = pd.Series(False, index=df.index)
            for col in df.columns:
                mask |= df[col].astype(str).str.lower().str.contains(term, na=False)
            df = df[mask]

        # 2. Per-column filters
        for f in req.filters:
            col = f.column
            if col not in df.columns:
                continue
            op = f.operator.lower()
            val = f.value
            
            if op == "is_null":
                df = df[df[col].isna()]
            elif op == "not_null":
                df = df[df[col].notna()]
            elif val is not None and str(val).strip() != "":
                s = df[col]
                if op == "equals":
                    if pd.api.types.is_numeric_dtype(s):
                        try:
                            df = df[s == float(val)]
                        except ValueError:
                            pass
                    else:
                        df = df[s.astype(str).str.lower() == str(val).lower()]
                elif op == "contains":
                    df = df[s.astype(str).str.lower().str.contains(str(val).lower(), na=False)]
                elif op == "starts_with":
                    df = df[s.astype(str).str.lower().str.startswith(str(val).lower(), na=False)]
                elif op in ["gt", "gte", "lt", "lte"]:
                    try:
                        num_val = float(val)
                        num_col = pd.to_numeric(s, errors="coerce")
                        if op == "gt":
                            df = df[num_col > num_val]
                        elif op == "gte":
                            df = df[num_col >= num_val]
                        elif op == "lt":
                            df = df[num_col < num_val]
                        elif op == "lte":
                            df = df[num_col <= num_val]
                    except ValueError:
                        pass

        filtered_rows = len(df)

        # 3. Sorting
        if req.sort_by and req.sort_by in df.columns:
            ascending = (req.sort_order == "asc")
            df = df.sort_values(by=req.sort_by, ascending=ascending, na_position="last")

        # 4. Column selection
        columns_to_return = df.columns
        if req.columns:
            valid_cols = [c for c in req.columns if c in df.columns]
            if valid_cols:
                columns_to_return = valid_cols

        # 5. Pagination
        page = max(1, req.page)
        page_size = min(100, max(1, req.page_size))
        total_pages = max(1, math.ceil(filtered_rows / page_size))
        
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        paged_df = df.iloc[start_idx:end_idx][columns_to_return]
        
        # Schemas
        col_schemas = dataset_service.get_column_schemas(df[columns_to_return])
        
        rows = [clean_record_dict(r) for r in paged_df.to_dict(orient="records")]
        
        return QueryResponse(
            dataset_id=dataset_id,
            total_rows=total_rows,
            filtered_rows=filtered_rows,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            columns=col_schemas,
            rows=rows
        )

exploration_service = ExplorationService()

import pandas as pd
import numpy as np
from typing import Dict, Any, List

from app.schemas.profiling import (
    DatasetProfileResponse, ColumnProfile, NumericColumnProfile,
    CategoricalColumnProfile, DatetimeColumnProfile, TextColumnProfile,
    QualityIssue
)
from app.services.dataset_service import dataset_service
from app.utils.serializer import clean_value

class ProfilingService:
    def profile_dataset(self, dataset_id: str) -> DatasetProfileResponse:
        df = dataset_service.load_active_df(dataset_id)
        total_rows = len(df)
        total_cols = len(df.columns)
        total_cells = total_rows * total_cols
        
        # Memory usage in KB
        memory_usage_kb = round(float(df.memory_usage(deep=True).sum() / 1024), 2)
        
        # Duplicate rows
        dup_count = int(df.duplicated().sum())
        dup_pct = round(float(dup_count / total_rows * 100), 2) if total_rows > 0 else 0.0
        
        # Missing values
        missing_cells = int(df.isna().sum().sum())
        missing_pct = round(float(missing_cells / total_cells * 100), 2) if total_cells > 0 else 0.0
        
        column_profiles: Dict[str, ColumnProfile] = {}
        quality_issues: List[QualityIssue] = []
        
        numeric_count = 0
        categorical_count = 0
        datetime_count = 0
        text_count = 0
        
        # Check overall duplicate records
        if dup_count > 0:
            quality_issues.append(QualityIssue(
                severity="error",
                category="duplicates",
                column=None,
                description=f"Found {dup_count} duplicate row(s) in the dataset.",
                affected_count=dup_count,
                affected_percentage=dup_pct
            ))
            
        for col in df.columns:
            s = df[col]
            inferred_type = dataset_service.infer_column_type(s)
            col_nulls = int(s.isna().sum())
            col_null_pct = round(float(col_nulls / total_rows * 100), 2) if total_rows > 0 else 0.0
            
            # Check missing values quality issue
            if col_nulls > 0:
                quality_issues.append(QualityIssue(
                    severity="error" if col_null_pct > 20 else "warning",
                    category="missing_values",
                    column=str(col),
                    description=f"Column '{col}' has {col_nulls} ({col_null_pct}%) missing value(s).",
                    affected_count=col_nulls,
                    affected_percentage=col_null_pct
                ))
            
            # Constant column check
            unique_non_null = s.dropna().nunique()
            if unique_non_null == 1:
                quality_issues.append(QualityIssue(
                    severity="warning",
                    category="constant_column",
                    column=str(col),
                    description=f"Column '{col}' has only one constant value across all rows.",
                    affected_count=total_rows,
                    affected_percentage=100.0
                ))
                
            # Possible ID column check
            if unique_non_null == total_rows and ("id" in str(col).lower() or "code" in str(col).lower() or "key" in str(col).lower()):
                quality_issues.append(QualityIssue(
                    severity="warning",
                    category="id_column",
                    column=str(col),
                    description=f"Column '{col}' appears to be a unique record identifier.",
                    affected_count=total_rows,
                    affected_percentage=100.0
                ))

            num_profile = None
            cat_profile = None
            dt_profile = None
            txt_profile = None

            if inferred_type == "numeric":
                numeric_count += 1
                valid_num = pd.to_numeric(s, errors="coerce").dropna()
                
                # Check for dirty non-numeric values in numeric columns (e.g. 'unknown')
                invalid_count = int(s.notna().sum() - valid_num.count())
                if invalid_count > 0:
                    quality_issues.append(QualityIssue(
                        severity="warning",
                        category="mixed_types",
                        column=str(col),
                        description=f"Column '{col}' has {invalid_count} non-numeric invalid string(s) (e.g. 'unknown') in numeric data.",
                        affected_count=invalid_count,
                        affected_percentage=round(invalid_count / total_rows * 100, 2)
                    ))

                if len(valid_num) > 0:
                    q25 = float(valid_num.quantile(0.25))
                    q75 = float(valid_num.quantile(0.75))
                    iqr = q75 - q25
                    lower_bound = q25 - (1.5 * iqr)
                    upper_bound = q75 + (1.5 * iqr)
                    outliers = valid_num[(valid_num < lower_bound) | (valid_num > upper_bound)]
                    outlier_count = len(outliers)
                    
                    if outlier_count > 0:
                        outlier_pct = round(float(outlier_count / len(valid_num) * 100), 2)
                        quality_issues.append(QualityIssue(
                            severity="warning",
                            category="outliers",
                            column=str(col),
                            description=f"Detected {outlier_count} outlier candidate(s) ({outlier_pct}%) based on 1.5x IQR.",
                            affected_count=outlier_count,
                            affected_percentage=outlier_pct
                        ))
                    
                    num_profile = NumericColumnProfile(
                        count=int(valid_num.count()),
                        missing_count=col_nulls,
                        mean=clean_value(round(float(valid_num.mean()), 3)),
                        median=clean_value(round(float(valid_num.median()), 3)),
                        std=clean_value(round(float(valid_num.std()), 3)),
                        min=clean_value(float(valid_num.min())),
                        max=clean_value(float(valid_num.max())),
                        q25=clean_value(round(q25, 3)),
                        q75=clean_value(round(q75, 3)),
                        iqr=clean_value(round(iqr, 3)),
                        outlier_count=outlier_count,
                        lower_bound=clean_value(round(lower_bound, 3)),
                        upper_bound=clean_value(round(upper_bound, 3))
                    )
            elif inferred_type == "categorical":
                categorical_count += 1
                cardinality = round(float(unique_non_null / total_rows), 3) if total_rows > 0 else 0.0
                if cardinality > 0.8 and total_rows > 20:
                    quality_issues.append(QualityIssue(
                        severity="warning",
                        category="high_cardinality",
                        column=str(col),
                        description=f"Categorical column '{col}' has very high cardinality ({unique_non_null} unique values).",
                        affected_count=unique_non_null,
                        affected_percentage=round(cardinality * 100, 1)
                    ))
                
                # Top values
                counts = s.value_counts(dropna=True).head(5)
                top_vals = [{"value": clean_value(k), "count": int(v), "percentage": round(float(v / total_rows * 100), 2)} for k, v in counts.items()]
                
                cat_profile = CategoricalColumnProfile(
                    unique_count=unique_non_null,
                    missing_count=col_nulls,
                    cardinality=cardinality,
                    top_values=top_vals
                )
            elif inferred_type == "datetime":
                datetime_count += 1
                try:
                    parsed = pd.to_datetime(s, errors="coerce")
                    valid_dt = parsed.dropna()
                    dt_profile = DatetimeColumnProfile(
                        valid_count=len(valid_dt),
                        missing_count=int(parsed.isna().sum()),
                        min_date=str(valid_dt.min().strftime("%Y-%m-%d")) if len(valid_dt) > 0 else None,
                        max_date=str(valid_dt.max().strftime("%Y-%m-%d")) if len(valid_dt) > 0 else None
                    )
                except Exception:
                    dt_profile = DatetimeColumnProfile(valid_count=0, missing_count=total_rows)
            else:  # text
                text_count += 1
                valid_str = s.dropna().astype(str)
                empty_count = int((valid_str.str.strip() == "").sum())
                avg_len = round(float(valid_str.str.len().mean()), 1) if len(valid_str) > 0 else 0.0
                txt_profile = TextColumnProfile(
                    empty_strings_count=empty_count,
                    avg_length=avg_len,
                    distinct_count=unique_non_null
                )

            column_profiles[str(col)] = ColumnProfile(
                name=str(col),
                dtype=str(s.dtype),
                category=inferred_type,
                numeric_stats=num_profile,
                categorical_stats=cat_profile,
                datetime_stats=dt_profile,
                text_stats=txt_profile
            )

        # Health / Quality score calculation (0 - 100)
        # Deduct for missing %, duplicate %, and severe issues
        score = 100.0
        score -= min(missing_pct * 1.5, 30.0)
        score -= min(dup_pct * 2.0, 20.0)
        error_count = sum(1 for q in quality_issues if q.severity == "error")
        warning_count = sum(1 for q in quality_issues if q.severity == "warning")
        score -= min(error_count * 5.0, 25.0)
        score -= min(warning_count * 1.5, 15.0)
        quality_score = max(round(score, 1), 10.0)

        return DatasetProfileResponse(
            dataset_id=dataset_id,
            total_rows=total_rows,
            total_columns=total_cols,
            total_cells=total_cells,
            memory_usage_kb=memory_usage_kb,
            duplicate_rows_count=dup_count,
            duplicate_rows_percentage=dup_pct,
            missing_cells_count=missing_cells,
            missing_cells_percentage=missing_pct,
            numeric_columns_count=numeric_count,
            categorical_columns_count=categorical_count,
            datetime_columns_count=datetime_count,
            text_columns_count=text_count,
            columns=column_profiles,
            quality_issues=quality_issues,
            quality_score=quality_score
        )

profiling_service = ProfilingService()

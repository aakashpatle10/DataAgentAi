import pandas as pd
import numpy as np
from scipy import stats
from typing import List, Dict, Any, Optional
from fastapi import HTTPException

from app.schemas.statistics import (
    DescriptiveStatsItem, CorrelationResponse, CorrelationPair,
    OutlierReport, GroupAnalysisRow, GroupAnalysisResponse,
    LinearRegressionResponse
)
from app.services.dataset_service import dataset_service
from app.utils.serializer import clean_value, clean_record_dict

class StatisticsService:
    def get_descriptive_stats(self, dataset_id: str) -> List[DescriptiveStatsItem]:
        df = dataset_service.load_active_df(dataset_id)
        num_cols = [c for c in df.columns if dataset_service.infer_column_type(df[c]) == "numeric"]
        
        items = []
        for col in num_cols:
            s = pd.to_numeric(df[col], errors="coerce").dropna()
            if len(s) == 0:
                continue
                
            mode_series = s.mode()
            mode_val = clean_value(mode_series.iloc[0]) if len(mode_series) > 0 else None
            
            skew_val = float(s.skew()) if len(s) > 2 else None
            kurt_val = float(s.kurtosis()) if len(s) > 3 else None
            
            items.append(DescriptiveStatsItem(
                column=str(col),
                count=int(s.count()),
                mean=clean_value(round(float(s.mean()), 3)),
                median=clean_value(round(float(s.median()), 3)),
                mode=mode_val,
                std=clean_value(round(float(s.std()), 3)),
                variance=clean_value(round(float(s.var()), 3)),
                min=clean_value(float(s.min())),
                q25=clean_value(round(float(s.quantile(0.25)), 3)),
                q75=clean_value(round(float(s.quantile(0.75)), 3)),
                max=clean_value(float(s.max())),
                skewness=clean_value(round(skew_val, 3)) if skew_val is not None else None,
                kurtosis=clean_value(round(kurt_val, 3)) if kurt_val is not None else None
            ))
        return items

    def get_correlations(self, dataset_id: str) -> CorrelationResponse:
        df = dataset_service.load_active_df(dataset_id)
        num_cols = [c for c in df.columns if dataset_service.infer_column_type(df[c]) == "numeric"]
        if len(num_cols) < 2:
            raise HTTPException(status_code=400, detail="Correlation analysis requires at least 2 numeric columns.")
            
        num_df = df[num_cols].apply(pd.to_numeric, errors="coerce")
        cols = list(num_df.columns)
        pearson_df = num_df.corr(method="pearson").round(3)
        spearman_df = num_df.corr(method="spearman").round(3)
        
        pairs: List[CorrelationPair] = []
        for i in range(len(cols)):
            for j in range(i + 1, len(cols)):
                c1, c2 = cols[i], cols[j]
                r = float(pearson_df.loc[c1, c2])
                rho = float(spearman_df.loc[c1, c2]) if not pd.isna(spearman_df.loc[c1, c2]) else None
                
                if abs(r) >= 0.7:
                    rel = "Strong Positive" if r > 0 else "Strong Negative"
                elif abs(r) >= 0.4:
                    rel = "Moderate Positive" if r > 0 else "Moderate Negative"
                else:
                    rel = "Weak or Negligible"
                    
                pairs.append(CorrelationPair(
                    column_x=c1,
                    column_y=c2,
                    pearson_r=clean_value(r),
                    spearman_rho=clean_value(rho),
                    relationship=rel
                ))
                
        # Sort top correlations by absolute strength
        pairs.sort(key=lambda p: abs(p.pearson_r if p.pearson_r is not None else 0), reverse=True)
        
        pearson_matrix = [[clean_value(val) for val in row] for row in pearson_df.values]
        spearman_matrix = [[clean_value(val) for val in row] for row in spearman_df.values]

        return CorrelationResponse(
            columns=cols,
            pearson_matrix=pearson_matrix,
            spearman_matrix=spearman_matrix,
            top_correlations=pairs[:15]
        )

    def detect_outliers(self, dataset_id: str, column: Optional[str] = None) -> OutlierReport:
        df = dataset_service.load_active_df(dataset_id)
        num_cols = df.select_dtypes(include=[np.number]).columns
        if len(num_cols) == 0:
            raise HTTPException(status_code=400, detail="Dataset has no numeric columns for outlier detection.")
            
        target_col = column if (column and column in num_cols) else num_cols[0]
        s = df[target_col].dropna()
        
        q1 = float(s.quantile(0.25))
        q3 = float(s.quantile(0.75))
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        
        outliers_df = df[(df[target_col] < lower) | (df[target_col] > upper)]
        outlier_count = len(outliers_df)
        pct = round(float(outlier_count / len(df) * 100), 2) if len(df) > 0 else 0.0
        
        candidates = [clean_record_dict(r) for r in outliers_df.head(10).to_dict(orient="records")]

        return OutlierReport(
            column=target_col,
            total_records=len(df),
            outlier_count=outlier_count,
            outlier_percentage=pct,
            q1=clean_value(round(q1, 3)),
            q3=clean_value(round(q3, 3)),
            iqr=clean_value(round(iqr, 3)),
            lower_threshold=clean_value(round(lower, 3)),
            upper_threshold=clean_value(round(upper, 3)),
            method_explanation="Detected using Tukey's Interquartile Range (IQR) rule: values < Q1 - 1.5*IQR or > Q3 + 1.5*IQR.",
            candidates_preview=candidates
        )

    def group_analysis(self, dataset_id: str, group_by: str, metric_column: str) -> GroupAnalysisResponse:
        df = dataset_service.load_active_df(dataset_id)
        if group_by not in df.columns or metric_column not in df.columns:
            raise HTTPException(status_code=400, detail="Invalid group_by or metric_column.")
            
        # Group and aggregate
        grouped = df.groupby(group_by)[metric_column].agg(
            count="count",
            sum="sum",
            mean="mean",
            median="median",
            min="min",
            max="max"
        ).reset_index()
        
        # Sort by sum or mean descending
        grouped = grouped.sort_values(by="sum", ascending=False).head(50)
        
        rows = []
        for _, r in grouped.iterrows():
            rows.append(GroupAnalysisRow(
                group=str(r[group_by]),
                count=int(r["count"]),
                sum=clean_value(round(float(r["sum"]), 2)),
                mean=clean_value(round(float(r["mean"]), 2)),
                median=clean_value(round(float(r["median"]), 2)),
                min=clean_value(round(float(r["min"]), 2)),
                max=clean_value(round(float(r["max"]), 2))
            ))
            
        return GroupAnalysisResponse(
            group_by=group_by,
            metric_column=metric_column,
            results=rows
        )

    def linear_regression(self, dataset_id: str, x_column: str, y_column: str) -> LinearRegressionResponse:
        df = dataset_service.load_active_df(dataset_id)
        if x_column not in df.columns or y_column not in df.columns:
            raise HTTPException(status_code=400, detail="Invalid column specified for regression.")
            
        clean_subset = df[[x_column, y_column]].dropna()
        if len(clean_subset) < 3:
            raise HTTPException(status_code=400, detail="Not enough valid data points for regression analysis.")
            
        x = clean_subset[x_column].astype(float)
        y = clean_subset[y_column].astype(float)
        
        res = stats.linregress(x, y)
        r2 = round(float(res.rvalue ** 2), 4)
        slope = round(float(res.slope), 4)
        intercept = round(float(res.intercept), 4)
        p_val = round(float(res.pvalue), 6)
        
        formula = f"{y_column} = {slope} * {x_column} {'+' if intercept >= 0 else '-'} {abs(intercept)}"
        interp = f"R² is {r2} ({round(r2*100, 1)}% of variance explained). The relationship is {'statistically significant (p < 0.05)' if p_val < 0.05 else 'not statistically significant'}."

        return LinearRegressionResponse(
            x_column=x_column,
            y_column=y_column,
            slope=slope,
            intercept=intercept,
            r_squared=r2,
            p_value=p_val,
            formula=formula,
            interpretation=interp
        )

statistics_service = StatisticsService()

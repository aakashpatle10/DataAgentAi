import pandas as pd
import numpy as np
from typing import List, Dict, Any
from fastapi import HTTPException

from app.schemas.charts import ChartConfigRequest, ChartResponse, ChartRecommendation
from app.services.dataset_service import dataset_service
from app.utils.serializer import clean_value

COLOR_PALETTE = [
    "#6366f1", "#06b6d4", "#10b981", "#f59e0b",
    "#ec4899", "#8b5cf6", "#3b82f6", "#14b8a6"
]

class ChartService:
    def generate_chart(self, dataset_id: str, cfg: ChartConfigRequest) -> ChartResponse:
        df = dataset_service.load_active_df(dataset_id)
        chart_type = cfg.chart_type.lower()
        title = cfg.title or f"{chart_type.title()} Chart"

        # Base layout styling for modern clean SaaS interface
        base_layout = {
            "title": {"text": title, "font": {"family": "Inter, sans-serif", "size": 16, "color": "#1e293b"}},
            "paper_bgcolor": "transparent",
            "plot_bgcolor": "transparent",
            "font": {"family": "Inter, sans-serif", "color": "#475569"},
            "margin": {"l": 50, "r": 30, "t": 50, "b": 50},
            "xaxis": {"gridcolor": "#f1f5f9", "zerolinecolor": "#e2e8f0"},
            "yaxis": {"gridcolor": "#f1f5f9", "zerolinecolor": "#e2e8f0"},
            "hoverlabel": {"bgcolor": "#1e293b", "font": {"color": "#ffffff", "family": "Inter, sans-serif"}},
            "autosize": True
        }

        # Heatmap (Correlation Matrix)
        if chart_type == "heatmap":
            num_df = df.select_dtypes(include=[np.number])
            if num_df.shape[1] < 2:
                raise HTTPException(status_code=400, detail="Correlation heatmap requires at least 2 numeric columns.")
            corr = num_df.corr().round(3)
            trace = {
                "type": "heatmap",
                "z": [[clean_value(val) for val in row] for row in corr.values],
                "x": list(corr.columns),
                "y": list(corr.columns),
                "colorscale": "Viridis",
                "zmin": -1.0,
                "zmax": 1.0,
                "hoverongaps": False
            }
            return ChartResponse(
                title=title or "Correlation Heatmap",
                chart_type="heatmap",
                plotly_data=[trace],
                plotly_layout=base_layout,
                point_count=num_df.shape[1] ** 2
            )

        # Histogram
        if chart_type == "histogram":
            if not cfg.x_column or cfg.x_column not in df.columns:
                raise HTTPException(status_code=400, detail="Histogram requires a valid x_column.")
            x_vals = df[cfg.x_column].dropna().tolist()
            trace = {
                "type": "histogram",
                "x": [clean_value(v) for v in x_vals],
                "marker": {"color": "#6366f1", "opacity": 0.85},
                "name": cfg.x_column
            }
            base_layout["xaxis"]["title"] = cfg.x_column
            base_layout["yaxis"]["title"] = "Frequency"
            return ChartResponse(
                title=title,
                chart_type="histogram",
                plotly_data=[trace],
                plotly_layout=base_layout,
                point_count=len(x_vals)
            )

        # Box Plot
        if chart_type == "box":
            if not cfg.y_column or cfg.y_column not in df.columns:
                raise HTTPException(status_code=400, detail="Box plot requires a numeric y_column.")
            traces = []
            if cfg.x_column and cfg.x_column in df.columns:
                groups = df[cfg.x_column].dropna().unique()[:10]  # Cap groups
                for i, g in enumerate(groups):
                    subset = df[df[cfg.x_column] == g][cfg.y_column].dropna()
                    traces.append({
                        "type": "box",
                        "y": [clean_value(v) for v in subset],
                        "name": str(g),
                        "marker": {"color": COLOR_PALETTE[i % len(COLOR_PALETTE)]}
                    })
            else:
                y_vals = df[cfg.y_column].dropna().tolist()
                traces.append({
                    "type": "box",
                    "y": [clean_value(v) for v in y_vals],
                    "name": cfg.y_column,
                    "marker": {"color": "#6366f1"}
                })
            base_layout["yaxis"]["title"] = cfg.y_column
            return ChartResponse(
                title=title,
                chart_type="box",
                plotly_data=traces,
                plotly_layout=base_layout,
                point_count=len(traces)
            )

        # Pie Chart
        if chart_type == "pie":
            if not cfg.x_column or cfg.x_column not in df.columns:
                raise HTTPException(status_code=400, detail="Pie chart requires categorical labels in x_column.")
            s = df[cfg.x_column].dropna()
            if s.nunique() > 15:
                raise HTTPException(status_code=400, detail="Column has too many categories (>15) for a readable pie chart.")
            
            if cfg.y_column and cfg.y_column in df.columns and cfg.aggregation in ["sum", "mean"]:
                grouped = df.groupby(cfg.x_column)[cfg.y_column].agg(cfg.aggregation).reset_index()
                labels = grouped[cfg.x_column].astype(str).tolist()
                values = [clean_value(v) for v in grouped[cfg.y_column].tolist()]
            else:
                counts = s.value_counts().head(10)
                labels = [str(k) for k in counts.keys()]
                values = [int(v) for v in counts.values]
                
            trace = {
                "type": "pie",
                "labels": labels,
                "values": values,
                "marker": {"colors": COLOR_PALETTE[:len(labels)]},
                "textinfo": "label+percent",
                "hole": 0.35
            }
            return ChartResponse(
                title=title,
                chart_type="pie",
                plotly_data=[trace],
                plotly_layout=base_layout,
                point_count=len(labels)
            )

        # Bar, Line, Scatter, Area
        if not cfg.x_column or cfg.x_column not in df.columns:
            raise HTTPException(status_code=400, detail="Selected x_column does not exist.")
        if not cfg.y_column or cfg.y_column not in df.columns:
            raise HTTPException(status_code=400, detail="Selected y_column does not exist.")

        # Aggregation Handling
        agg = cfg.aggregation or "none"
        if agg != "none" and agg in ["sum", "mean", "count", "min", "max"]:
            # Check high cardinality limit on group
            if df[cfg.x_column].nunique() > 50:
                # Top 30 groups to keep chart readable
                top_keys = df[cfg.x_column].value_counts().head(30).index
                df = df[df[cfg.x_column].isin(top_keys)]
                
            grouped = df.groupby(cfg.x_column)[cfg.y_column].agg(agg).reset_index()
            x_vals = [clean_value(x) for x in grouped[cfg.x_column].tolist()]
            y_vals = [clean_value(y) for y in grouped[cfg.y_column].tolist()]
        else:
            sample_df = df.head(500)  # limit points for browser performance
            x_vals = [clean_value(x) for x in sample_df[cfg.x_column].tolist()]
            y_vals = [clean_value(y) for y in sample_df[cfg.y_column].tolist()]

        base_layout["xaxis"]["title"] = cfg.x_column
        base_layout["yaxis"]["title"] = f"{agg.title()} of {cfg.y_column}" if agg != "none" else cfg.y_column

        trace: Dict[str, Any] = {
            "x": x_vals,
            "y": y_vals,
            "name": cfg.y_column
        }

        if chart_type == "bar":
            trace["type"] = "bar"
            trace["marker"] = {"color": "#6366f1"}
        elif chart_type == "line":
            trace["type"] = "scatter"
            trace["mode"] = "lines+markers"
            trace["line"] = {"color": "#6366f1", "width": 2.5}
            trace["marker"] = {"size": 6}
        elif chart_type == "area":
            trace["type"] = "scatter"
            trace["mode"] = "lines"
            trace["fill"] = "tozeroy"
            trace["line"] = {"color": "#6366f1", "width": 2}
            trace["fillcolor"] = "rgba(99, 102, 241, 0.15)"
        elif chart_type == "scatter":
            trace["type"] = "scatter"
            trace["mode"] = "markers"
            trace["marker"] = {"color": "#6366f1", "size": 7, "opacity": 0.8}

        return ChartResponse(
            title=title,
            chart_type=chart_type,
            plotly_data=[trace],
            plotly_layout=base_layout,
            point_count=len(x_vals)
        )

    def recommend_charts(self, dataset_id: str) -> List[ChartRecommendation]:
        df = dataset_service.load_active_df(dataset_id)
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = [c for c in df.columns if c not in num_cols and df[c].nunique() <= 20]
        date_cols = [c for c in df.columns if "date" in c.lower() or "time" in c.lower()]

        recommendations = []

        # 1. Categorical vs Numeric Bar Chart
        if cat_cols and num_cols:
            recommendations.append(ChartRecommendation(
                id="rec_bar_agg",
                title=f"{num_cols[0]} by {cat_cols[0]}",
                description=f"Total aggregated {num_cols[0]} grouped by {cat_cols[0]}.",
                chart_type="bar",
                config=ChartConfigRequest(
                    chart_type="bar",
                    x_column=cat_cols[0],
                    y_column=num_cols[0],
                    aggregation="sum",
                    title=f"Total {num_cols[0]} by {cat_cols[0]}"
                )
            ))

        # 2. Time Trend (Line / Area)
        if date_cols and num_cols:
            recommendations.append(ChartRecommendation(
                id="rec_trend_line",
                title=f"{num_cols[0]} Trend Over Time",
                description=f"Evolution of {num_cols[0]} indexed by {date_cols[0]}.",
                chart_type="line",
                config=ChartConfigRequest(
                    chart_type="line",
                    x_column=date_cols[0],
                    y_column=num_cols[0],
                    aggregation="none",
                    title=f"{num_cols[0]} Over Time"
                )
            ))

        # 3. Correlation Heatmap
        if len(num_cols) >= 2:
            recommendations.append(ChartRecommendation(
                id="rec_corr_matrix",
                title="Correlation Heatmap",
                description="Visual matrix showing pairwise linear relationships across numeric variables.",
                chart_type="heatmap",
                config=ChartConfigRequest(
                    chart_type="heatmap",
                    title="Correlation Heatmap"
                )
            ))

        # 4. Scatter Plot of Two Primary Numerics
        if len(num_cols) >= 2:
            recommendations.append(ChartRecommendation(
                id="rec_scatter",
                title=f"{num_cols[0]} vs {num_cols[1]}",
                description=f"Scatter distribution examining co-variance between {num_cols[0]} and {num_cols[1]}.",
                chart_type="scatter",
                config=ChartConfigRequest(
                    chart_type="scatter",
                    x_column=num_cols[0],
                    y_column=num_cols[1],
                    title=f"{num_cols[0]} vs {num_cols[1]}"
                )
            ))

        # 5. Distribution Histogram
        if num_cols:
            recommendations.append(ChartRecommendation(
                id="rec_histogram",
                title=f"Distribution of {num_cols[0]}",
                description=f"Frequency histogram showing skewness and spread of {num_cols[0]}.",
                chart_type="histogram",
                config=ChartConfigRequest(
                    chart_type="histogram",
                    x_column=num_cols[0],
                    title=f"Distribution of {num_cols[0]}"
                )
            ))

        # 6. Low-Cardinality Pie Chart
        if cat_cols:
            recommendations.append(ChartRecommendation(
                id="rec_pie_share",
                title=f"Share of {cat_cols[0]}",
                description=f"Proportional breakdown across {cat_cols[0]}.",
                chart_type="pie",
                config=ChartConfigRequest(
                    chart_type="pie",
                    x_column=cat_cols[0],
                    title=f"Distribution of {cat_cols[0]}"
                )
            ))

        return recommendations

chart_service = ChartService()

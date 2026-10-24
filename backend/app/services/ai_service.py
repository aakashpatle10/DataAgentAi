import json
import re
import httpx
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

from app.config import settings
from app.schemas.ai import AiStatusResponse, AiChatResponse
from app.schemas.charts import ChartConfigRequest
from app.services.dataset_service import dataset_service
from app.services.chart_service import chart_service
from app.repositories.dataset_repository import repository
from app.utils.serializer import clean_value, clean_record_dict

SYSTEM_PROMPT = """
You are DataAgent AI, an intelligent, conversational, evidence-based AI Data Analyst and Senior Business Growth Strategist integrated into an enterprise analytics platform.

Your mission:
1. Converse naturally and intelligently with the user.
2. Provide simple, friendly replies for casual chat (never force unwanted data analysis into simple greetings).
3. Deliver deep, data-backed business growth plans, strategic analysis, and proven business techniques when asked.
4. Answer data questions by explaining thoroughly in conversational text first, and recommending an interactive chart at the very end only when a visual genuinely enhances understanding.

---
### CORE OPERATING PRINCIPLES:

1. SIMPLE & NATURAL CONVERSATION FOR CASUAL CHAT:
- If the user sends a greeting or casual chat (e.g., "hi", "hello", "hey", "namaste", "kaise ho", "kya haal hai", "thanks", "who are you", "kya kar sakte ho", "help"):
  -> Give a simple, friendly, warm, and natural conversational response (1-3 sentences).
  -> DO NOT force an unprompted metric dump, column listing, or heavy analysis into a simple greeting!
  -> Introduce yourself and invite them to ask about their data or request business growth strategies.

2. DETAILED BUSINESS GROWTH & STRATEGY PLANS (WHEN REQUESTED):
- When the user asks for business advice, a growth plan, sales improvement, or strategic guidance (e.g., "business grow karne ke liye plan batao", "sales kaise badhaye", "mere data ke according strategy batao", "give me growth techniques"):
  -> Act as a top-tier Chief Strategy & Growth Officer.
  -> Formulate a comprehensive, structured, practical Action Plan using their ACTUAL data numbers.
  -> Structure the plan logically:
     • 📊 **Current Health Check**: Overview of revenue, profit, margins, and key highlights.
     • 🚀 **1. Hero Products Focus (80/20 Pareto Principle)**: Identify top revenue and profit drivers. Recommend prioritizing their inventory, marketing budget, and premium visibility.
     • 📦 **2. Cross-Selling & Product Bundling (AOV Booster)**: Pair high-volume, lower-ticket accessories with flagship items to increase Average Order Value (AOV).
     • 🌍 **3. Regional & Channel Expansion**: Target underperforming regions with localized promotions; reward top regions with loyalty perks.
     • 🏷️ **4. Margin & Discount Optimization**: Audit high-discount orders; reduce discounts on inelastic, high-demand items to plug profit leakage.
     • 🎯 **5. Immediate 30-Day Action Roadmap**: 3-4 concrete priorities to execute immediately.
  -> Ground every recommendation in realistic business techniques, marketing psychology, and actual numbers from the dataset.

3. EXPLAIN THOROUGHLY IN CHAT FIRST, GRAPH AT THE VERY END:
- Whenever answering a data question, ALWAYS explain everything clearly in text first (the direct answer, the business reason, key supporting numbers, and comparisons).
- If and only if a visual representation is genuinely helpful (e.g. comparing product sales, monthly trends, regional breakdown), recommend the chart AT THE VERY END using the JSON format below.
- NEVER recommend a chart for greetings, general advice, or purely conceptual chat unless the user explicitly asked for a chart/graph.

4. LANGUAGE ADAPTATION:
- If the user writes in Hindi or Hinglish (e.g., "kis product ne jyada revenue diya", "plan batao", "sales kaise badhaye"), respond in natural, professional, clear Hinglish.
- If the user writes in English, reply in professional, polished English.

5. CURRENCY:
- Always format monetary metrics with the Indian Rupee symbol '₹' (e.g., ₹27,18,742 or ₹15,85,080).

6. CHART RECOMMENDATION FORMAT (ONLY AT THE VERY END OF MESSAGE):
```chart_recommendation
{
  "chart_type": "bar",
  "x_column": "ColumnName",
  "y_column": "ColumnName",
  "aggregation": "sum",
  "title": "Clear Descriptive Title"
}
```
Supported chart_types: "bar", "line", "scatter", "pie", "histogram", "box".
"""

class AiService:
    def get_status(self) -> AiStatusResponse:
        has_key = bool(settings.AI_API_KEY and len(settings.AI_API_KEY.strip()) > 5)
        return AiStatusResponse(
            is_configured=has_key,
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL,
            message="Google Gemini AI Analyst is active and grounded in active dataset context." if has_key else "Running in Deterministic Heuristic mode.",
            available_fallback_features=[
                "Deterministic Intent Parser (Pandas / NumPy)",
                "Automated Column Grouping & Aggregations",
                "Pearson Correlation Diagnostics",
                "Data Quality & Missing Value Diagnostics",
                "Interactive Chart Suggestions"
            ]
        )

    def _build_dataset_context(self, df: pd.DataFrame, dataset_name: str) -> str:
        """
        Builds a rich, pre-computed analytical context from the active dataframe.
        Avoids unbounded raw row dumps while giving Gemini exact calculated numbers.
        """
        total_rows = len(df)
        total_cols = len(df.columns)
        
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = [c for c in df.columns if c not in num_cols]

        # Numeric statistics summary
        num_summary = {}
        for c in num_cols:
            s = df[c].dropna()
            if len(s) > 0:
                num_summary[c] = {
                    "total_sum": round(float(s.sum()), 2),
                    "mean": round(float(s.mean()), 2),
                    "min": round(float(s.min()), 2),
                    "max": round(float(s.max()), 2),
                    "missing": int(df[c].isna().sum())
                }

        # Key categorical aggregations (e.g. Products, Categories, Regions)
        cat_aggregations = {}
        # Select best metric for aggregation (Revenue, Profit, Sales, or first numeric)
        primary_metric = None
        for cand in ["revenue", "total_revenue", "sales", "profit", "amount"]:
            match = next((c for c in num_cols if cand in c.lower()), None)
            if match:
                primary_metric = match
                break
        if not primary_metric and num_cols:
            primary_metric = num_cols[0]

        for c in cat_cols:
            nunique = df[c].nunique()
            if nunique <= 60:
                # Top values by frequency
                top_counts = df[c].value_counts().head(5).to_dict()
                entry = {"unique_count": nunique, "top_by_frequency": top_counts}
                
                # If we have a primary metric, aggregate by it!
                if primary_metric:
                    try:
                        grp = df.groupby(c)[primary_metric].sum().sort_values(ascending=False).head(5)
                        entry[f"top_by_{primary_metric}"] = {str(k): round(float(v), 2) for k, v in grp.items()}
                        
                        bottom = df.groupby(c)[primary_metric].sum().sort_values(ascending=True).head(3)
                        entry[f"lowest_by_{primary_metric}"] = {str(k): round(float(v), 2) for k, v in bottom.items()}
                    except Exception:
                        pass
                cat_aggregations[c] = entry

        # Sample rows (first 5)
        sample_records = [clean_record_dict(r) for r in df.head(5).to_dict(orient="records")]

        context_dict = {
            "dataset_name": dataset_name,
            "total_rows": total_rows,
            "total_columns": total_cols,
            "columns": [str(c) for c in df.columns],
            "numeric_metrics_summary": num_summary,
            "categorical_breakdowns": cat_aggregations,
            "primary_metric_analyzed": primary_metric,
            "sample_rows_preview": sample_records,
            "duplicate_rows": int(df.duplicated().sum()),
            "total_missing_cells": int(df.isna().sum().sum()),
        }

        return json.dumps(context_dict, indent=2, default=str)

    def _deterministic_analysis(self, dataset_id: str, df: pd.DataFrame, message: str) -> AiChatResponse:
        """
        Robust deterministic fallback powered by Pandas and NumPy.
        Understands Hindi, Hinglish, and English analytical and conversational queries.
        """
        msg = message.lower().strip()
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = [c for c in df.columns if c not in num_cols]

        # 0. Casual greetings & conversational checks (No forced analysis!)
        greeting_words = ["hi", "hello", "hey", "namaste", "kaise ho", "kya haal", "kya haal hai", "who are you", "kya kar sakte ho", "help", "good morning", "good evening", "shukriya", "thanks", "thank you"]
        words_only = re.sub(r"[^\w\s]", "", msg).strip().split()
        is_greeting = (
            any(g in msg for g in ["namaste", "kaise ho", "kya haal", "who are you", "kya kar sakte ho"]) or
            (len(words_only) <= 3 and any(w in greeting_words for w in words_only))
        )
        if is_greeting:
            answer = (
                "Namaste! 👋 Main aapka **DataAgent AI** analyst hoon.\n\n"
                "Main aapke uploaded data ko samajhne, business insights nikalne, aur data ke hisaab se **growth strategies plan** karne me aapki madad karta hoon.\n\n"
                "Aap mujhse:\n"
                "- Koi bhi sawal pooch sakte hain (jaise: *'Kis product ne sabse zyada revenue diya?'*)\n"
                "- Apne business ko grow karne ke liye strategy mang sakte hain (jaise: *'Mere business ko grow karne ke liye plan batao'*)\n"
                "- Specific trends, data quality, ya chart comparisons samajh sakte hain!"
            )
            return AiChatResponse(
                answer=answer,
                intent_recognized="conversational_greeting",
                is_ai_live=False,
                suggested_followups=[
                    "Mere business ko grow karne ke liye plan batao",
                    "Kis product ne sabse jyada revenue diya?",
                    "Show monthly sales trend"
                ]
            )

        # 1. Business Growth & Strategic Planning (Detailed Blueprint)
        strategy_words = ["grow", "growth", "business", "plan", "strategy", "badhaye", "sales kaise", "badhana", "tarika", "kaise badha", "technique", "recommendation", "suggestion", "ideas", "advice", "profit kaise", "tips"]
        if any(w in msg for w in strategy_words):
            rev_col = next((c for c in num_cols if any(k in c.lower() for k in ["revenue", "sales_amount", "amount", "sales"])), None)
            prof_col = next((c for c in num_cols if any(k in c.lower() for k in ["profit", "margin", "earnings"])), None)
            prod_col = next((c for c in cat_cols if any(k in c.lower() for k in ["product", "item", "sku"])), None)
            cat_col = next((c for c in cat_cols if any(k in c.lower() for k in ["category", "dept", "segment"])), None)
            reg_col = next((c for c in cat_cols if any(k in c.lower() for k in ["region", "zone", "state", "city"])), None)

            total_rev = float(df[rev_col].sum()) if rev_col else 0.0
            total_prof = float(df[prof_col].sum()) if prof_col else 0.0
            margin_pct = round((total_prof / total_rev * 100), 1) if total_rev > 0 else 0.0

            top_prod_name = "Top Item"
            top_prod_rev = 0.0
            if prod_col and rev_col:
                p_grp = df.groupby(prod_col)[rev_col].sum().sort_values(ascending=False)
                if not p_grp.empty:
                    top_prod_name = str(p_grp.index[0])
                    top_prod_rev = float(p_grp.iloc[0])

            top_cat_name = "Top Category"
            if cat_col and rev_col:
                c_grp = df.groupby(cat_col)[rev_col].sum().sort_values(ascending=False)
                if not c_grp.empty:
                    top_cat_name = str(c_grp.index[0])

            weak_reg_name = "Specific Territories"
            if reg_col and rev_col:
                r_grp = df.groupby(reg_col)[rev_col].sum().sort_values(ascending=True)
                if not r_grp.empty:
                    weak_reg_name = str(r_grp.index[0])

            answer = (
                f"### 📈 Data-Backed Business Growth Blueprint\n\n"
                f"Aapke active dataset ke verified numbers ke mutabiq, yahan aapke business ke liye actionable **Growth Strategy & Techniques** hain:\n\n"
                f"#### 📊 Business Health Overview:\n"
                f"- **Total Revenue**: ₹{total_rev:,.2f}\n"
                f"- **Total Profit**: ₹{total_prof:,.2f} (Overall Net Margin: **{margin_pct}%**)\n"
                f"- **Top Revenue Driver**: **{top_prod_name}** (₹{top_prod_rev:,.2f})\n"
                f"- **Leading Category**: **{top_cat_name}**\n\n"
                f"---\n\n"
                f"#### 🚀 1. Hero Products Focus (80/20 Pareto Rule)\n"
                f"- Aapka **{top_prod_name}** total revenue me sabse bada yogdan de raha hai.\n"
                f"- **Strategy**: Inventory aur marketing budget ka 60% top 2-3 products par allocate karein. In items ko apni website ya store par spotlight me rakhein taaki cash flow aur margins steady rahein.\n\n"
                f"#### 📦 2. Product Bundling & Cross-Selling (AOV Booster)\n"
                f"- High-ticket items ({top_prod_name}) ke sath fast-moving accessories ka **Bundle Deal** banayein.\n"
                f"- **Technique**: *'Bundle & Save 10%'* offer dein. Isse customer ke purchase decision fast honge aur Average Order Value (AOV) 20-30% boost hogi.\n\n"
                f"#### 🌍 3. Regional Scaling & Localized Marketing\n"
                f"- **{weak_reg_name}** jaise lagging regions me targeted online promotions aur free delivery offers run karein, jabki top performing regions me repeat customer loyalty programs lagayein.\n\n"
                f"#### 🏷️ 4. Discount & Margin Leakage Control\n"
                f"- Jin products ki demand already strong hai, unpar aggressive discounts cut karein. Sirf 3-5% discount kam karne se aapka direct net profit margin 8-12% tak jump karega.\n\n"
                f"#### 🎯 5. Immediate 30-Day Action Roadmap:\n"
                f"1. **Week 1-2**: {top_prod_name} ka stock buffer badhayein aur bundle packages design karein.\n"
                f"2. **Week 3**: {weak_reg_name} region ke liye targeted digital campaigns launch karein.\n"
                f"3. **Week 4**: High margin category ({top_cat_name}) me discount policy audit karein."
            )
            return AiChatResponse(
                answer=answer,
                intent_recognized="business_growth_plan",
                is_ai_live=False,
                suggested_followups=[
                    "Kis product ne sabse jyada revenue diya?",
                    "Show monthly sales trend",
                    "Category-wise breakdown chart dikhao"
                ]
            )

        # 2. Missing values inquiry
        if any(w in msg for w in ["missing", "null", "empty", "khali", "chhota"]):
            missing_dict = df.isna().sum()
            missing_cols = {k: int(v) for k, v in missing_dict.items() if v > 0}
            if missing_cols:
                summary = "Missing values identified in dataset:\n" + "\n".join([f"- **{k}**: {v} missing values ({round(v/len(df)*100, 1)}%)" for k, v in missing_cols.items()])
                answer = f"{summary}\n\nYou can easily resolve these in the **Data Cleaning Studio** using median, mean, or constant imputation."
            else:
                answer = "Is dataset me koi bhi missing values (null cells) nahi hain. Data poori tarah complete hai!"
            return AiChatResponse(
                answer=answer,
                intent_recognized="missing_values_audit",
                is_ai_live=False,
                computed_data={"missing_values_by_column": missing_cols},
                suggested_followups=["Are there any duplicate rows?", "Show correlation matrix", "Which category has the highest revenue?"]
            )

        # 3. Duplicate rows inquiry
        if any(w in msg for w in ["duplicate", "nakli", "same row"]):
            dup_count = int(df.duplicated().sum())
            if dup_count > 0:
                answer = f"Found **{dup_count} duplicate row(s)** ({round(dup_count/len(df)*100, 1)}% of dataset).\n\nNavigate to **Data Cleaning** to eliminate these duplicates in one click."
            else:
                answer = "Is dataset me koi duplicate rows nahi hain. Sabhi records distinct hain."
            return AiChatResponse(
                answer=answer,
                intent_recognized="duplicates_audit",
                is_ai_live=False,
                computed_data={"duplicate_count": dup_count},
                suggested_followups=["Which column has the highest variance?", "Show me top revenue products"]
            )

        # 4. Correlation inquiry
        if any(w in msg for w in ["relationship", "correlat", "sambandh"]):
            if len(num_cols) >= 2:
                c1, c2 = num_cols[0], num_cols[1]
                for col in num_cols:
                    if col.lower() in msg:
                        c1 = col
                        break
                remaining = [c for c in num_cols if c != c1]
                if remaining:
                    for col in remaining:
                        if col.lower() in msg:
                            c2 = col
                            break
                            
                r = round(float(df[[c1, c2]].dropna().corr().iloc[0, 1]), 3)
                chart = None
                try:
                    if dataset_id:
                        chart = chart_service.generate_chart(
                            dataset_id=dataset_id,
                            cfg=ChartConfigRequest(chart_type="scatter", x_column=c1, y_column=c2, title=f"{c1} vs {c2}")
                        )
                except Exception:
                    pass
                answer = f"**{c1}** aur **{c2}** ke beech Pearson correlation: **r = {r}**.\n\n" + (
                    "Yeh ek strong positive linear relationship darshata hai." if r > 0.7 else
                    "Yeh ek moderate association darshata hai." if abs(r) >= 0.4 else
                    "In donon features ke beech koi strong linear relation nahi hai."
                )
                return AiChatResponse(
                    answer=answer,
                    intent_recognized="correlation_analysis",
                    is_ai_live=False,
                    suggested_chart=chart,
                    computed_data={"column_x": c1, "column_y": c2, "pearson_r": r},
                    suggested_followups=["Which product generated the highest revenue?", "Show outlier analysis"]
                )

        # 5. Grouped queries (e.g. "kis product ne jyada revenue diya", "top product", "highest profit")
        target_num = None
        for cand in ["revenue", "profit", "sales", "sales_amount", "amount", "units_sold"]:
            match = next((c for c in num_cols if cand in c.lower()), None)
            if match and (cand in msg or "revenue" in msg or "profit" in msg or "sales" in msg or "kamai" in msg):
                target_num = match
                break
        if not target_num and num_cols:
            target_num = num_cols[0]

        target_cat = None
        for cand in ["product", "item", "category", "region", "channel", "city", "country"]:
            match = next((c for c in cat_cols if cand in c.lower()), None)
            if match and (cand in msg or (cand == "product" and any(k in msg for k in ["product", "cheez", "item"]))):
                target_cat = match
                break
        if not target_cat and cat_cols:
            target_cat = cat_cols[0]

        if target_num and target_cat:
            is_lowest = any(w in msg for w in ["lowest", "kam", "sabse kam", "least", "minimum"])
            grouped = df.groupby(target_cat)[target_num].sum().sort_values(ascending=is_lowest).reset_index()
            top_record = grouped.iloc[0]
            top_name = str(top_record[target_cat])
            top_val = round(float(top_record[target_num]), 2)
            
            chart = None
            try:
                if dataset_id:
                    chart = chart_service.generate_chart(
                        dataset_id=dataset_id,
                        cfg=ChartConfigRequest(
                            chart_type="bar",
                            x_column=target_cat,
                            y_column=target_num,
                            aggregation="sum",
                            title=f"Total {target_num} by {target_cat}"
                        )
                    )
            except Exception:
                pass

            rank_word = "sabse kam" if is_lowest else "sabse jyada"
            is_money = any(k in target_num.lower() for k in ["revenue", "profit", "cost", "price", "amount", "sales"])
            sym = "₹" if is_money else ""
            answer = f"Dataset analysis ke mutabiq, **{target_cat}** ke hisaab se **{rank_word} {target_num}**:\n\n" \
                     f"🏆 **{top_name}** ({sym}{top_val:,.2f})\n\n" \
                     f"**Top Breakdown:**\n" + \
                     "\n".join([f"- **{r[target_cat]}**: {sym}{round(float(r[target_num]), 2):,}" for _, r in grouped.head(5).iterrows()])

            return AiChatResponse(
                answer=answer,
                intent_recognized="grouped_aggregation",
                is_ai_live=False,
                suggested_chart=chart,
                computed_data={"breakdown": grouped.head(10).to_dict(orient="records")},
                suggested_followups=["Which region has lowest profit?", "Show outlier analysis", "Generate PDF report"]
            )

        # 6. Default General Overview
        row_count = len(df)
        col_count = len(df.columns)
        answer = f"Is dataset me total **{row_count:,} records** aur **{col_count} columns** hain.\n\n" \
                 f"- **Numeric metrics**: {', '.join(num_cols[:5]) if num_cols else 'None'}\n" \
                 f"- **Categorical dimensions**: {', '.join(cat_cols[:5]) if cat_cols else 'None'}\n\n" \
                 f"Aap mujhse:\n" \
                 f"- *'Kis product ne sabse jyada revenue diya?'*\n" \
                 f"- *'Mere business ko grow karne ke liye plan batao'*\n" \
                 f"- *'Are there any missing values or duplicates?'* pooch sakte hain."
        return AiChatResponse(
            answer=answer,
            intent_recognized="dataset_overview",
            is_ai_live=False,
            suggested_followups=["Mere business ko grow karne ke liye plan batao", "Kis product ne jyada revenue diya?", "Show correlation heatmap"]
        )

    async def chat(self, dataset_id: str, message: str) -> AiChatResponse:
        df = dataset_service.load_active_df(dataset_id)
        meta = repository.get_dataset_meta(dataset_id) or {}
        dataset_name = meta.get("name", "Active Dataset")

        has_key = bool(settings.AI_API_KEY and len(settings.AI_API_KEY.strip()) > 5)

        if has_key:
            # Build verified analytical context
            context_str = self._build_dataset_context(df, dataset_name)
            
            # Fetch recent conversation history for natural conversational context
            history = repository.get_chat_history(dataset_id)[-6:]
            history_str = ""
            if history:
                history_str = "### RECENT CONVERSATION HISTORY:\n" + "\n".join([
                    f"- {h.get('role', 'user').title()}: {h.get('content', '')[:300]}"
                    for h in history
                ]) + "\n\n"

            prompt_content = (
                f"{SYSTEM_PROMPT}\n\n"
                f"### VERIFIED DATASET CALCULATIONS & CONTEXT:\n{context_str}\n\n"
                f"{history_str}"
                f"### CURRENT USER INQUIRY:\n{message}\n\n"
                f"Answer the user following the core principles: simple natural reply for greetings, detailed structured plan with techniques for business growth inquiries, explain in chat first, and only include a chart recommendation at the end if a visual is genuinely helpful."
            )

            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt_content}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.25,
                    "maxOutputTokens": 2048
                }
            }

            # Try working models: gemini-3.5-flash, gemini-3.8-flash, settings.AI_MODEL
            models_to_try = ["gemini-3.5-flash", "gemini-3.8-flash", settings.AI_MODEL, "gemini-flash-latest"]
            unique_models = []
            for m in models_to_try:
                if m and m not in unique_models:
                    unique_models.append(m)

            api_key = settings.AI_API_KEY.strip()
            for model_name in unique_models:
                url = f"{settings.AI_BASE_URL}/models/{model_name}:generateContent?key={api_key}"
                try:
                    async with httpx.AsyncClient(timeout=22.0) as client:
                        res = await client.post(url, json=payload)
                        if res.status_code == 200:
                            data = res.json()
                            candidates = data.get("candidates", [])
                            if candidates and "content" in candidates[0]:
                                parts = candidates[0]["content"].get("parts", [])
                                full_text = "".join([p.get("text", "") for p in parts]).strip()
                                
                                # Extract any chart recommendation JSON block from end of response
                                chart = None
                                chart_match = re.search(r"```chart_recommendation\s*([\s\S]*?)\s*```", full_text)
                                if chart_match:
                                    try:
                                        chart_cfg_data = json.loads(chart_match.group(1))
                                        chart_cfg = ChartConfigRequest(
                                            chart_type=chart_cfg_data.get("chart_type", "bar"),
                                            x_column=chart_cfg_data.get("x_column"),
                                            y_column=chart_cfg_data.get("y_column"),
                                            aggregation=chart_cfg_data.get("aggregation", "sum"),
                                            title=chart_cfg_data.get("title")
                                        )
                                        chart = chart_service.generate_chart(dataset_id, chart_cfg)
                                        # Remove chart recommendation block from visible text
                                        full_text = re.sub(r"```chart_recommendation\s*[\s\S]*?\s*```", "", full_text).strip()
                                    except Exception:
                                        pass

                                # Only generate a fallback chart if the user explicitly requested a chart/graph
                                if not chart and any(k in message.lower() for k in ["chart", "graph", "plot", "visualize", "dikhao graph", "graph banao", "chart dikhao"]):
                                    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
                                    cat_cols = [c for c in df.columns if c not in num_cols]
                                    target_num = next((c for c in num_cols if any(k in c.lower() for k in ["revenue", "sales", "profit", "amount"])), num_cols[0] if num_cols else None)
                                    target_cat = next((c for c in cat_cols if any(k in c.lower() for k in ["product", "category", "region"])), cat_cols[0] if cat_cols else None)
                                    if target_num and target_cat:
                                        try:
                                            chart = chart_service.generate_chart(
                                                dataset_id,
                                                ChartConfigRequest(chart_type="bar", x_column=target_cat, y_column=target_num, aggregation="sum", title=f"Top {target_cat} by {target_num}")
                                            )
                                        except Exception:
                                            pass

                                result = AiChatResponse(
                                    answer=full_text,
                                    intent_recognized="gemini_natural_language",
                                    is_ai_live=True,
                                    suggested_chart=chart,
                                    suggested_followups=[
                                        "Mere business ko grow karne ke liye plan batao",
                                        "Which category generated highest profit?",
                                        "Show regional sales breakdown"
                                    ]
                                )
                                repository.save_chat_message(dataset_id, {"role": "user", "content": message})
                                repository.save_chat_message(dataset_id, {"role": "assistant", "content": result.answer, "intent": result.intent_recognized})
                                return result
                except Exception:
                    continue

        # Fallback cleanly to high-precision deterministic Pandas analysis
        fallback_res = self._deterministic_analysis(dataset_id, df, message)
        repository.save_chat_message(dataset_id, {"role": "user", "content": message})
        repository.save_chat_message(dataset_id, {"role": "assistant", "content": fallback_res.answer, "intent": fallback_res.intent_recognized})
        return fallback_res

ai_service = AiService()

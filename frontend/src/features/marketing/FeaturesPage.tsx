import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  ShieldCheck,
  BarChart3,
  MessageSquare,
  FileCheck2,
  TrendingUp,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
  Lock,
  Undo2,
  FileSpreadsheet,
  HelpCircle,
} from "lucide-react";

export const FeaturesPage: React.FC = () => {
  return (
    <div className="space-y-24 py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE6DE] border border-[#DAD3C6] text-[#226192] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#A9B887]" />
          <span>Platform Capabilities</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#133857] uppercase tracking-tight leading-tight">
          Everything You Need To <br />
          <span className="text-[#226192]">Understand Your Data.</span>
        </h1>
        <p className="text-base text-[#5B5245] leading-relaxed max-w-2xl mx-auto">
          From the moment you drop a messy spreadsheet to generating executive presentations,
          every tool in DataAgent AI works in harmony with verified calculations.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#226192] hover:bg-[#1B4F77] text-white text-xs font-bold shadow-md shadow-[#226192]/20 transition-all group"
          >
            <span>Open Product Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="space-y-16">
        {/* 1. Upload & Profiling */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#226192] text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5 text-[#A9B887]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133857] uppercase">
              1. Dataset Upload & Instant Profiling
            </h2>
            <p className="text-sm text-[#5B5245] leading-relaxed">
              Drop any CSV, Excel (.xlsx, .xls), or JSON file up to 25MB. The backend automatically
              validates file structure and infers semantic column types (numeric, categorical, datetime, text, boolean).
            </p>
            <ul className="space-y-2 text-xs text-[#5B5245] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Deterministic calculation of rows, columns, and memory footprints</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Immediate detection of duplicate rows and missing cell percentages</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Comprehensive 0–100 Data Quality Score generated on ingestion</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 bg-[#EAE6DE]/60 border border-[#DAD3C6] rounded-2xl p-6 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-[#133857] font-bold pb-2 border-b border-[#DAD3C6]">
              <span>Dataset Diagnostic Scanner</span>
              <span className="text-[#6F804F]">Score: 99/100</span>
            </div>
            <div className="space-y-1.5 text-[#5B5245]">
              <div>• Total Rows: 152 verified records</div>
              <div>• Features: 14 distinct attributes</div>
              <div>• Missing Values: 6 cells detected across 2 columns</div>
              <div>• Duplicate Rows: 2 redundant transactions identified</div>
              <div>• Storage Engine: 100% MongoDB-Native collections</div>
            </div>
          </div>
        </div>

        {/* 2. Data Cleaning Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-[#EAE6DE]/60 border border-[#DAD3C6] rounded-2xl p-6 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-[#133857] font-bold pb-2 border-b border-[#DAD3C6]">
              <span>Transformation Stack</span>
              <span className="text-[#226192]">Live Preview Available</span>
            </div>
            <div className="space-y-2 text-[#5B5245]">
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DAD3C6]">
                <span className="font-bold text-[#133857]">Step 1: Deduplicate Rows</span>
                <p className="text-[11px] text-[#6F804F] mt-0.5">Purged 2 duplicate records based on primary identifier.</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DAD3C6]">
                <span className="font-bold text-[#133857]">Step 2: Impute Missing Categories</span>
                <p className="text-[11px] text-[#6F804F] mt-0.5">Filled 3 missing customer segments with mode ("Consumer").</p>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#DAD3C6]">
                <span className="font-bold text-[#133857]">Step 3: Trim Whitespace</span>
                <p className="text-[11px] text-[#6F804F] mt-0.5">Normalized untrimmed category strings.</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#226192] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#A9B887]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133857] uppercase">
              2. Data Cleaning With Confidence
            </h2>
            <p className="text-sm text-[#5B5245] leading-relaxed">
              Never worry about corrupting your data. DataAgent AI maintains an immutable original
              snapshot in MongoDB (`dataset_records_orig`). Every transformation can be previewed
              before applying and undone step-by-step with a single click.
            </p>
            <ul className="space-y-2 text-xs text-[#5B5245] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Remove duplicate records with customizable column keys</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Impute missing values using Mean, Median, Mode, or Constant values</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Type conversion (Integer, Float, Datetime, String, Boolean) with safe fallbacks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>One-click Reset to Original State at any point</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Interactive Plotly Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#226192] text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5 text-[#A9B887]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133857] uppercase">
              3. Interactive Visualizations
            </h2>
            <p className="text-sm text-[#5B5245] leading-relaxed">
              Generate responsive, publication-quality Plotly charts directly from your verified numbers.
              Hover over data points, zoom into time series, isolate categories, and export figures in seconds.
            </p>
            <ul className="space-y-2 text-xs text-[#5B5245] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Bar charts for category revenue and profit comparisons</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Monthly, weekly, and daily time-series line trends</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Scatter plots with linear regression trendlines for margin exploration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Donut & Pie breakdowns styled in our 3-color editorial palette</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 bg-[#EAE6DE]/60 border border-[#DAD3C6] rounded-2xl p-6 space-y-4">
            <div className="text-xs font-bold text-[#133857] flex items-center justify-between">
              <span>Category Breakdown Preview</span>
              <span className="text-[#226192]">Plotly Engine</span>
            </div>
            <div className="space-y-3">
              {[
                { name: "Furniture", val: "$41,552", pct: "49.4%", color: "bg-[#226192]" },
                { name: "Electronics", val: "$24,831", pct: "29.5%", color: "bg-[#3884BE]" },
                { name: "Accessories", val: "$14,106", pct: "16.8%", color: "bg-[#A9B887]" },
                { name: "Office Supplies", val: "$3,622", pct: "4.3%", color: "bg-[#6F804F]" },
              ].map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs text-[#133857] font-semibold">
                    <span>{c.name}</span>
                    <span>{c.val} ({c.pct})</span>
                  </div>
                  <div className="w-full bg-[#FAF8F5] h-2 rounded-full overflow-hidden border border-[#DAD3C6]/60">
                    <div className={`h-full ${c.color}`} style={{ width: c.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. AI Data Analyst Q&A */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-[#226192] text-white rounded-2xl p-6 space-y-4 shadow-lg shadow-[#226192]/20">
            <div className="flex items-center gap-2 text-xs font-bold text-[#A9B887]">
              <Sparkles className="w-4 h-4" />
              <span>Google Gemini 3.5 Flash Grounded Analyst</span>
            </div>
            <div className="p-3 bg-white/10 rounded-xl text-xs space-y-1">
              <span className="text-[#A9B887] font-mono text-[10px] uppercase">User Prompt (Hinglish):</span>
              <p className="font-semibold text-white">"Kis product ne jyada revenue diya?"</p>
            </div>
            <div className="p-3.5 bg-white/10 rounded-xl text-xs space-y-2 leading-relaxed text-[#EAE6DE]">
              <span className="text-[#A9B887] font-mono text-[10px] uppercase">Grounded Response:</span>
              <p>
                Sabse jyada revenue <strong>MacBook Pro</strong> ne generate kiya hai!
              </p>
              <div className="font-mono text-[11px] bg-black/20 p-2 rounded text-white space-y-0.5">
                <div>• Total Revenue: $45,000</div>
                <div>• Total Profit: $13,500</div>
                <div>• Units Sold: 25</div>
              </div>
              <p className="text-[11px]">
                Supporting bar chart automatically rendered in your workspace.
              </p>
            </div>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#226192] text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5 text-[#A9B887]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133857] uppercase">
              4. Grounded AI Data Analyst
            </h2>
            <p className="text-sm text-[#5B5245] leading-relaxed">
              Unlike generic chatbots that guess numbers, DataAgent AI precomputes statistical summaries,
              exact grouped metrics, and sample distributions from your active dataset before calling Gemini.
            </p>
            <ul className="space-y-2 text-xs text-[#5B5245] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Zero Hallucination: operates only on verified calculations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Full bilingual fluency: ask in Hindi, Hinglish, or English</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Automatic chart generation matching the conversational context</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Conversation history stored per-dataset in MongoDB</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 5. Statistical Modeling */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12">
          <div className="lg:col-span-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#226192] text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5 text-[#A9B887]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133857] uppercase">
              5. Rigorous Statistical Engine
            </h2>
            <p className="text-sm text-[#5B5245] leading-relaxed">
              Explore relationships between variables with mathematical certainty. Our backend uses
              SciPy and NumPy to compute correlation matrices and candidate outliers without arbitrary code execution.
            </p>
            <ul className="space-y-2 text-xs text-[#5B5245] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Descriptive stats: Mean, Median, Mode, Variance, Std Dev, Min, Max, Quartiles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Pearson & Spearman correlation matrices across all numeric columns</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Tukey's IQR Outlier Scanner with candidate flagging (not false error labeling)</span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 bg-[#EAE6DE]/60 border border-[#DAD3C6] rounded-2xl p-6 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-[#133857] font-bold pb-2 border-b border-[#DAD3C6]">
              <span>Correlation Matrix (Pearson)</span>
              <span className="text-[#226192]">r-value</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-[#FAF8F5] p-2 rounded-lg border border-[#DAD3C6]">
                <span>Revenue ↔ Profit</span>
                <span className="font-bold text-[#6F804F]">+0.94 (Very Strong)</span>
              </div>
              <div className="flex justify-between items-center bg-[#FAF8F5] p-2 rounded-lg border border-[#DAD3C6]">
                <span>Units Sold ↔ Revenue</span>
                <span className="font-bold text-[#6F804F]">+0.78 (Strong)</span>
              </div>
              <div className="flex justify-between items-center bg-[#FAF8F5] p-2 rounded-lg border border-[#DAD3C6]">
                <span>Unit Price ↔ Profit Margin</span>
                <span className="font-bold text-[#226192]">+0.42 (Moderate)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Reports & Deliverables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12">
          <div className="lg:col-span-6 order-2 lg:order-1 bg-[#EAE6DE]/60 border border-[#DAD3C6] rounded-2xl p-6 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between text-[#133857] font-bold pb-2 border-b border-[#DAD3C6]">
              <span>Executive Deliverables</span>
              <span className="text-[#6F804F]">One-Click</span>
            </div>
            <div className="space-y-2 text-[#5B5245]">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DAD3C6] space-y-1">
                <span className="font-bold text-[#133857]">PDF Executive Report</span>
                <p className="text-[11px]">Formatted summary with executive tables, quality scoring, correlation matrices, and analytical caveats.</p>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DAD3C6] space-y-1">
                <span className="font-bold text-[#133857]">Cleaned CSV Export</span>
                <p className="text-[11px]">Streamed directly from memory with all deduplication and imputation applied.</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#226192] text-white flex items-center justify-center shadow-xs">
              <FileCheck2 className="w-5 h-5 text-[#A9B887]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133857] uppercase">
              6. Executive Reports & Exports
            </h2>
            <p className="text-sm text-[#5B5245] leading-relaxed">
              Take your findings straight to stakeholders. Export pristine cleaned data to CSV or
              generate an enterprise-ready PDF analytics report complete with professional typography.
            </p>
            <ul className="space-y-2 text-xs text-[#5B5245] pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Executive PDF generation powered by ReportLab in-memory buffers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Direct CSV streaming with zero disk clutter</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0" />
                <span>Saved projects history for instant retrieval</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center pt-8">
        <div className="p-10 sm:p-14 rounded-3xl bg-[#226192] text-white space-y-6 max-w-4xl mx-auto shadow-xl shadow-[#226192]/20">
          <h2 className="text-3xl sm:text-4xl font-black uppercase">
            Ready To Experience These Features?
          </h2>
          <p className="text-sm text-[#EAE6DE] max-w-xl mx-auto">
            Open the product dashboard, upload your dataset, and experience the full analytics suite live.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#133857] hover:bg-[#FAF8F5] font-bold text-sm shadow-md transition-all group"
            >
              <span>Launch Product Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

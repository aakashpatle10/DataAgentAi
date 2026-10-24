import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  UploadCloud,
  Eye,
  SlidersHorizontal,
  TrendingUp,
  MessageSquare,
  BarChart3,
  FileDown,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Cpu,
} from "lucide-react";

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: "01",
      icon: UploadCloud,
      title: "Upload Your Tabular Dataset",
      desc: "Drag and drop your CSV, Excel, or JSON file. The backend reads the file directly into memory, enforces a 25MB safety limit, parses schema columns, and saves records directly to MongoDB.",
      details: [
        "Instant file structure & encoding validation",
        "Semantic column type inference (numeric, categorical, datetime)",
        "Zero temporary disk storage; 100% MongoDB-Native persistence",
      ],
      tag: "Data Ingestion",
    },
    {
      num: "02",
      icon: Eye,
      title: "Automated Data Profiling",
      desc: "Before you write a query, our diagnostic scanner scans every cell to calculate total records, missing values per column, duplicate row counts, and generates an overarching 0–100 Data Health Score.",
      details: [
        "Immediate detection of duplicate records",
        "Missing cell percentages calculated per column",
        "Deterministic statistical summary of every numeric feature",
      ],
      tag: "Diagnostics",
    },
    {
      num: "03",
      icon: SlidersHorizontal,
      title: "Inspect & Clean Messy Records",
      desc: "Select recommended cleaning operations or define custom rules. You can deduplicate rows, impute null values with mean/mode, or cast types—with a live before-and-after preview before applying.",
      details: [
        "Preview transformations before committing",
        "Immutable original snapshot preserved in MongoDB",
        "Step-by-step undo and full reset supported at any time",
      ],
      tag: "Preparation",
    },
    {
      num: "04",
      icon: TrendingUp,
      title: "Deterministic Math & Statistical Engine",
      desc: "Pandas and NumPy execute actual calculations: grouped sums, means, standard deviations, Pearson correlation coefficients, and candidate outliers via Tukey's IQR rule.",
      details: [
        "Zero code execution sandbox risks; approved operations only",
        "Calculations grounded strictly in active dataset numbers",
        "High-performance vectorized aggregations",
      ],
      tag: "Computation",
    },
    {
      num: "05",
      icon: MessageSquare,
      title: "Ask Natural-Language Questions",
      desc: "Type questions in Hindi, Hinglish, or English (e.g. 'Kis product ne jyada revenue diya?'). Gemini 3.5 Flash receives pre-computed dataset metrics and provides verified, clear answers with real numbers.",
      details: [
        "Natural language intent parser",
        "Strictly grounded context: never invents fake metrics",
        "Conversation history maintained per-dataset",
      ],
      tag: "AI Intelligence",
    },
    {
      num: "06",
      icon: BarChart3,
      title: "Render Interactive Plotly Visualizations",
      desc: "Whenever an insight is best understood visually, the AI generates a structured chart recommendation. Plotly renders responsive, interactive charts with zoom, hover tooltips, and category toggles.",
      details: [
        "Bar charts, line trends, category donuts, and scatter plots",
        "Clean 3-color editorial palette design",
        "Interactive hover inspections and full zoom controls",
      ],
      tag: "Visualization",
    },
    {
      num: "07",
      icon: FileDown,
      title: "Export Deliverables & Executive PDF Reports",
      desc: "Share your findings. Stream cleaned datasets directly to CSV, or compile a complete PDF report with overview tables, data quality scores, correlation matrices, and caveats.",
      details: [
        "ReportLab in-memory PDF generation with clean typography",
        "Streamed CSV export with all applied cleaning filters",
        "Executive presentation-ready formatting",
      ],
      tag: "Deliverables",
    },
  ];

  return (
    <div className="space-y-24 py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE6DE] border border-[#DAD3C6] text-[#226192] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#A9B887]" />
          <span>7-Step Workflow</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#133857] uppercase tracking-tight leading-tight">
          From Raw Data To <br />
          <span className="text-[#226192]">Clear Answers.</span>
        </h1>
        <p className="text-base text-[#5B5245] leading-relaxed max-w-2xl mx-auto">
          One straightforward, evidence-based workflow to explore, clean, analyze, visualize, and
          understand your data without writing a single line of code.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#226192] hover:bg-[#1B4F77] text-white text-xs font-bold shadow-md shadow-[#226192]/20 transition-all group"
          >
            <span>Try The Workflow In Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Connected 7-Step Sequence */}
      <section className="space-y-6 max-w-4xl mx-auto">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isLast = idx === steps.length - 1;
          return (
            <div key={idx} className="relative">
              {!isLast && (
                <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-[#DAD3C6] -z-10 hidden sm:block" />
              )}
              <div className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-6 sm:p-8 hover:border-[#226192] transition-colors shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#226192] text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-xs">
                      {st.num}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#226192]">
                        {st.tag}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-[#133857]">{st.title}</h3>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#EAE6DE] flex items-center justify-center text-[#133857] flex-shrink-0 self-start sm:self-auto">
                    <Icon className="w-4 h-4 text-[#226192]" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#5B5245] leading-relaxed pl-0 sm:pl-16">
                  {st.desc}
                </p>

                <div className="pl-0 sm:pl-16 pt-2">
                  <div className="bg-[#EAE6DE]/50 border border-[#DAD3C6] rounded-xl p-3.5 space-y-1.5">
                    {st.details.map((d, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 text-xs text-[#133857]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6F804F] flex-shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Technical Trust Section */}
      <section className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#226192] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#A9B887]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#133857] uppercase">
              The Architecture of Technical Trust
            </h3>
            <p className="text-xs text-[#5B5245]">Why our insights are verified, not simulated.</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5B5245] leading-relaxed">
          Standard AI products send raw text prompts to language models and ask them to perform math.
          LLMs are probabilistic pattern matchers—they frequently guess totals, miscalculate margins,
          and invent data points.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#E57373]/10 border border-[#E57373]/30 space-y-2">
            <span className="text-xs font-bold text-[#C62828] uppercase">Conventional AI Tools</span>
            <p className="text-xs text-[#5B5245] leading-relaxed">
              Feed raw text directly into an LLM and trust the generated numbers. High risk of fabricated
              metrics, inaccurate sums, and hallucinated correlations.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#6F804F]/10 border border-[#6F804F]/30 space-y-2">
            <span className="text-xs font-bold text-[#2E7D32] uppercase">DataAgent AI Architecture</span>
            <p className="text-xs text-[#5B5245] leading-relaxed">
              Pandas & NumPy execute the actual arithmetic. The verified result is then passed into
              Gemini 3.5 Flash for natural-language interpretation. Zero math hallucination.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center pt-6">
        <div className="p-10 sm:p-14 rounded-3xl bg-[#226192] text-white space-y-6 max-w-4xl mx-auto shadow-xl shadow-[#226192]/20">
          <h2 className="text-3xl sm:text-4xl font-black uppercase">
            Test The Workflow With Your Data
          </h2>
          <p className="text-sm text-[#EAE6DE] max-w-xl mx-auto">
            Drop your spreadsheet into our dashboard and watch DataAgent AI profile and analyze it in seconds.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#133857] hover:bg-[#FAF8F5] font-bold text-sm shadow-md transition-all group"
            >
              <span>Get Started In Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Cpu,
  Database,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Code2,
  BarChart3,
  Terminal,
  Server,
  Zap,
} from "lucide-react";

export const TechnologyPage: React.FC = () => {
  const techStack = [
    {
      category: "Frontend Application",
      tech: "React 18 & TypeScript",
      desc: "Component-driven client architecture bundled with Vite. Strictly typed interfaces ensure reliability between backend responses and UI rendering.",
      bullets: ["Vite 5 lightning build engine", "Tailwind CSS design token system", "TanStack Query v5 state management"],
    },
    {
      category: "Backend REST API",
      tech: "FastAPI & Python 3.14",
      desc: "Asynchronous, high-throughput REST service with automated OpenAPI documentation and strict Pydantic payload validation.",
      bullets: ["Asynchronous non-blocking endpoints", "Pydantic v2 strict type enforcement", "In-memory streaming responses"],
    },
    {
      category: "Data Processing Engine",
      tech: "Pandas & NumPy",
      desc: "The gold standard of mathematical computing. Performs deterministic row aggregations, missing value calculations, and groupby statistics.",
      bullets: ["C-optimized vectorized operations", "Accurate Tukey's IQR outlier formulas", "High-performance data transformations"],
    },
    {
      category: "Visualization Layer",
      tech: "Plotly.js",
      desc: "Interactive, D3-backed rendering engine capable of zooming, panning, and rendering complex distribution charts on the client without lag.",
      bullets: ["Responsive client-side rendering", "Interactive hover tooltips & legends", "Clean 3-color palette design tokens"],
    },
    {
      category: "AI Reasoning Layer",
      tech: "Google Gemini 3.5 Flash",
      desc: "High-speed reasoning model called via secure Google Generative Language APIs. Receives pre-computed summaries rather than raw token dumps.",
      bullets: ["1-2 second response latency", "Grounded prompt engineering", "Bilingual Hinglish & English support"],
    },
    {
      category: "Database & Persistence",
      tech: "MongoDB Native",
      desc: "Direct document storage for dataset records, original snapshots, transformation audit logs, and historical chat messages.",
      bullets: ["Indexed queries by dataset_id", "Zero local disk storage dependency", "Immutable original snapshot collection"],
    },
  ];

  return (
    <div className="space-y-24 py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE6DE] border border-[#DAD3C6] text-[#226192] text-xs font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5 text-[#A9B887]" />
          <span>System Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#133857] uppercase tracking-tight leading-tight">
          AI Reasoning. <br />
          <span className="text-[#226192]">Real Calculations.</span> Clear Results.
        </h1>
        <p className="text-base text-[#5B5245] leading-relaxed max-w-2xl mx-auto">
          DataAgent AI pairs modern AI natural-language understanding with established mathematical
          data-processing engines to guarantee verifiable results.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#226192] hover:bg-[#1B4F77] text-white text-xs font-bold shadow-md shadow-[#226192]/20 transition-all group"
          >
            <span>Explore Dashboard Live</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Lightweight Architecture Flow Diagram */}
      <section className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#226192]">
            Data Pipeline & Execution Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133857] uppercase">
            How An Analytical Query Flows
          </h2>
          <p className="text-xs text-[#5B5245]">
            Every step is authenticated, validated, and computed before any insight reaches the user.
          </p>
        </div>

        {/* Visual Flow Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            {
              step: "1. User Query",
              role: "User enters natural-language question or requests chart",
              sub: "Hinglish / English Input",
            },
            {
              step: "2. FastAPI API",
              role: "Validates active dataset ID & verifies authentication",
              sub: "Pydantic Schema Validation",
            },
            {
              step: "3. Pandas / NumPy",
              role: "Queries MongoDB records and executes exact math calculations",
              sub: "Vectorized Computation",
            },
            {
              step: "4. Gemini 3.5 Flash",
              role: "Interprets calculated metrics and formulates clear explanation",
              sub: "Grounded Reasoning",
            },
            {
              step: "5. Plotly View",
              role: "Renders interactive chart and presents findings to user",
              sub: "Interactive Visualization",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#EAE6DE]/50 border border-[#DAD3C6] rounded-2xl p-4 flex flex-col justify-between space-y-3 relative hover:border-[#226192] transition-colors"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#A9B887] uppercase tracking-wider">
                  Phase 0{idx + 1}
                </span>
                <h4 className="text-sm font-bold text-[#133857]">{item.step}</h4>
                <p className="text-xs text-[#5B5245] leading-relaxed">{item.role}</p>
              </div>
              <div className="pt-2 border-t border-[#DAD3C6]/60">
                <span className="text-[10px] font-mono text-[#226192] font-semibold">{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#226192]">
            Technology Stack
          </span>
          <h2 className="text-3xl font-extrabold text-[#133857] uppercase">
            Built On Battle-Tested Standards
          </h2>
          <p className="text-xs text-[#5B5245]">
            We rely exclusively on industry-standard open-source libraries and verified protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techStack.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:border-[#226192] hover:shadow-xs transition-all"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EAE6DE] text-[#5B5245] uppercase tracking-wider">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-[#133857]">{item.tech}</h3>
                <p className="text-xs text-[#5B5245] leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-4 border-t border-[#DAD3C6] space-y-1.5">
                {item.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-2 text-[11px] text-[#133857]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6F804F] flex-shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust, Safety & Security Section */}
      <section className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#226192] text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#A9B887]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#133857] uppercase">
              Zero Arbitrary Code Execution
            </h3>
            <p className="text-xs text-[#5B5245]">Safely running on validated operational boundaries.</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5B5245] leading-relaxed">
          Many experimental AI analytics agents attempt to execute arbitrary Python code generated by
          LLMs in sandbox containers. This introduces substantial security vectors, unpredictability,
          and silent calculation bugs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#EAE6DE]/50 border border-[#DAD3C6] space-y-1.5">
            <h5 className="text-xs font-bold text-[#133857]">Strict Parametric Operations</h5>
            <p className="text-[11px] text-[#5B5245]">
              Transformations (imputation, deduplication, casting) are executed through validated functions, not unreviewed LLM scripts.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#EAE6DE]/50 border border-[#DAD3C6] space-y-1.5">
            <h5 className="text-xs font-bold text-[#133857]">Immutable Data Snapshots</h5>
            <p className="text-[11px] text-[#5B5245]">
              Original records are stored in a dedicated MongoDB collection (`dataset_records_orig`), preventing accidental loss.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#EAE6DE]/50 border border-[#DAD3C6] space-y-1.5">
            <h5 className="text-xs font-bold text-[#133857]">Isolated Dataset Scope</h5>
            <p className="text-[11px] text-[#5B5245]">
              Every query, chart, and AI prompt is scoped strictly to the selected active dataset ID, eliminating cross-data contamination.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center pt-6">
        <div className="p-10 sm:p-14 rounded-3xl bg-[#226192] text-white space-y-6 max-w-4xl mx-auto shadow-xl shadow-[#226192]/20">
          <h2 className="text-3xl sm:text-4xl font-black uppercase">
            Explore Your Data With Confidence
          </h2>
          <p className="text-sm text-[#EAE6DE] max-w-xl mx-auto">
            Experience our grounded architecture in action. Open the dashboard and upload a file.
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

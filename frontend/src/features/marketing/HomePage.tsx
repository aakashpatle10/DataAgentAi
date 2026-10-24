import React, { useState } from "react";
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
  Code2,
  PieChart as PieIcon,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Check,
  AlertTriangle,
} from "lucide-react";
import { TiltCard } from "@/components/marketing/TiltCard";
import { useGsap } from "@/hooks/useGsap";
import gsap from "gsap";

export const HomePage: React.FC = () => {
  // Interactive Demonstration Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "cleaning" | "visuals" | "ai">("overview");

  // GSAP animation for hero content and cards
  const heroRef = useGsap(() => {
    gsap.from(".hero-fade", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
    });

    gsap.from(".capability-item", {
      opacity: 0,
      y: 15,
      stagger: 0.08,
      duration: 0.5,
      delay: 0.3,
      ease: "power2.out",
    });
  }, []);

  return (
    <div ref={heroRef} className="space-y-24 md:space-y-32 pb-24 overflow-hidden">
      {/* ========================================================= */}
      {/* SECTION A: HERO                                           */}
      {/* ========================================================= */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Subtle decorative background gradient blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#226192]/10 via-[#A9B887]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Product Messaging */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Eyebrow Pill */}
            <div className="hero-fade inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE6DE] border border-[#DAD3C6] text-[#226192] text-xs font-bold tracking-wider uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#A9B887]" />
              <span>AI-Powered Data Analytics</span>
            </div>

            {/* Primary Headline with Nexians-inspired bold editorial typography */}
            <div className="hero-fade space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#133857] leading-[1.08] uppercase">
                Your Data. <br />
                <span className="relative inline-block text-[#226192]">
                  Beyond The
                  <span className="absolute -bottom-1 left-0 right-0 h-2 bg-[#A9B887]/40 -z-10 rounded-sm" />
                </span>{" "}
                <br />
                Spreadsheet.
              </h1>
            </div>

            {/* Supporting Paragraph */}
            <p className="hero-fade text-base sm:text-lg text-[#5B5245] leading-relaxed max-w-xl font-normal">
              Upload your data, discover hidden patterns, clean messy records, and explore meaningful
              insights through natural-language questions—all in one workspace.
            </p>

            {/* CTAs */}
            <div className="hero-fade flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#226192] hover:bg-[#1B4F77] text-white text-sm font-semibold shadow-md shadow-[#226192]/20 hover:shadow-lg transition-all duration-200 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE6DE] text-[#133857] border border-[#DAD3C6] text-sm font-semibold transition-all duration-200 shadow-2xs"
              >
                <span>See How It Works</span>
              </Link>
            </div>

            {/* Micro Badge */}
            <div className="hero-fade flex items-center gap-4 text-xs font-medium text-[#5B5245] pt-1">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#6F804F]" />
                Explore
              </span>
              <span className="text-[#DAD3C6]">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#6F804F]" />
                Analyze
              </span>
              <span className="text-[#DAD3C6]">•</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#6F804F]" />
                Understand
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Dashboard Preview with Cursor Tilt */}
          <div className="lg:col-span-6 relative">
            <TiltCard maxRotation={4} perspective={1100} className="w-full">
              {/* Browser Mockup Container */}
              <div className="relative rounded-2xl border border-[#DAD3C6] bg-[#FAF8F5] p-2 sm:p-2.5 shadow-2xl shadow-[#133857]/10 overflow-hidden">
                {/* Browser Top Header */}
                <div className="flex items-center justify-between px-3 py-2 bg-[#EAE6DE]/70 border-b border-[#DAD3C6] rounded-t-xl mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E57373]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFB74D]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#81C784]" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-[#FAF8F5] border border-[#DAD3C6] text-[10px] text-[#5B5245] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887] animate-pulse" />
                    <span>dataagent.ai/dashboard</span>
                  </div>
                  <span className="text-[10px] text-[#5B5245] font-medium hidden sm:inline">Executive View</span>
                </div>

                {/* Actual Dashboard Screenshot Image */}
                <div className="relative rounded-lg overflow-hidden border border-[#DAD3C6] bg-[#FAF8F5]">
                  <img
                    src="/dashboard-preview.png"
                    alt="DataAgent AI Executive Dashboard with KPI metrics, revenue trend, category charts, and AI assistant"
                    className="w-full h-auto object-cover block select-none pointer-events-none"
                    loading="eager"
                  />
                </div>
              </div>
            </TiltCard>

            {/* Restrained Floating Decorative Badges */}
            <div className="absolute -top-3 -left-3 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#DAD3C6] shadow-lg text-[11px] font-semibold text-[#133857] animate-in fade-in duration-500">
              <span className="w-2 h-2 rounded-full bg-[#A9B887]" />
              <span>CSV uploaded — 152 records</span>
            </div>

            <div className="absolute -bottom-4 -right-2 hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#226192] text-white border border-[#1B4F77] shadow-lg text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#A9B887]" />
              <span>AI grounded in verified calculations</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION B: PRODUCT CAPABILITY STRIP                       */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 md:p-8 rounded-3xl bg-[#EAE6DE]/60 border border-[#DAD3C6] shadow-xs">
          <p className="text-center text-xs font-bold text-[#5B5245] uppercase tracking-wider mb-6">
            Everything Required To Go From Raw Data To Clear Insights
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                icon: UploadCloud,
                title: "Upload CSV & Excel",
                desc: "Instant schema & type detection",
              },
              {
                icon: ShieldCheck,
                title: "Quality Diagnostics",
                desc: "Missing values & duplicate detection",
              },
              {
                icon: BarChart3,
                title: "Interactive Charts",
                desc: "Plotly bar, line & scatter views",
              },
              {
                icon: MessageSquare,
                title: "Natural Language AI",
                desc: "Grounded Q&A in Hinglish/English",
              },
              {
                icon: FileCheck2,
                title: "Executive Reports",
                desc: "PDF reports & cleaned CSV exports",
              },
            ].map((cap, i) => {
              const Icon = cap.icon;
              return (
                <div
                  key={i}
                  className="capability-item bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 flex flex-col items-start gap-2.5 hover:border-[#226192] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#226192]/10 text-[#226192] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#133857] leading-tight">{cap.title}</h4>
                    <p className="text-[11px] text-[#5B5245] mt-1 leading-snug">{cap.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION C: PROBLEM & SOLUTION                             */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#226192]">
              Why DataAgent AI Exists
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#133857] leading-tight uppercase">
              Data Shouldn't <br />
              <span className="text-[#226192]">Require A Detour.</span>
            </h2>
            <p className="text-sm text-[#5B5245] leading-relaxed">
              Most business teams sit on spreadsheets they cannot easily analyze, while standard AI
              chatbots hallucinate numbers and formulas. DataAgent AI eliminates both bottlenecks.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                problem: "Messy & Unstructured",
                pain: "Datasets contain nulls, duplicates, and inconsistent data types that skew formulas.",
                solution: "Automated Data Profiler scores dataset health and suggests safe transformations.",
              },
              {
                problem: "Coding Bottlenecks",
                pain: "Grouping rows, aggregating revenue, and building charts often requires writing Python or SQL.",
                solution: "Deterministic Pandas backend computes exact sums and distributions with zero code.",
              },
              {
                problem: "AI Hallucinations",
                pain: "Generic LLMs fabricate metrics, invent non-existent products, and guess percentages.",
                solution: "Grounded AI Analyst operates only on verified calculation results from your active file.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#E57373] uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> The Roadblock
                  </span>
                  <h4 className="text-sm font-bold text-[#133857]">{item.problem}</h4>
                  <p className="text-xs text-[#5B5245] leading-relaxed">{item.pain}</p>
                </div>
                <div className="pt-3 border-t border-[#DAD3C6] space-y-1">
                  <span className="text-[10px] font-bold text-[#6F804F] uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> The Solution
                  </span>
                  <p className="text-xs text-[#133857] font-medium leading-relaxed">{item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION D: PRODUCT FEATURE HIGHLIGHTS                     */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#226192]">
            Comprehensive Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#133857] tracking-tight uppercase">
            Built For Complete <span className="text-[#226192]">Analytical Freedom</span>
          </h2>
          <p className="text-sm text-[#5B5245] leading-relaxed">
            Every tool in DataAgent AI is connected to your active dataset. Clean, visualize, and ask
            questions without switching between disconnected applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Eye,
              title: "Understand Your Data",
              desc: "Automatically inspect columns, inferred data types, unique counts, missing cell percentages, and memory footprints.",
              link: "/features",
              tag: "Profiling",
            },
            {
              icon: SlidersHorizontal,
              title: "Clean With Confidence",
              desc: "Deduplicate records, impute missing values with mean or mode, trim whitespace, and preview transformations before applying.",
              link: "/features",
              tag: "Preparation",
            },
            {
              icon: BarChart3,
              title: "Visualize What Matters",
              desc: "Generate interactive Plotly bar charts, line trends, category donuts, and scatter correlations directly from your data.",
              link: "/features",
              tag: "Visualization",
            },
            {
              icon: MessageSquare,
              title: "Ask Your Data Anything",
              desc: "Ask natural-language questions in Hinglish or English. Gemini 3.5 Flash plans the calculation and explains verified results.",
              link: "/features",
              tag: "AI Intelligence",
            },
            {
              icon: TrendingUp,
              title: "Beyond Basic Statistics",
              desc: "Compute standard deviations, quartiles, Pearson correlation matrices, and Tukey's IQR outlier candidates deterministically.",
              link: "/features",
              tag: "Deep Modeling",
            },
            {
              icon: FileCheck2,
              title: "Turn Findings Into Reports",
              desc: "Export clean datasets to CSV or generate professional executive PDF reports complete with overview tables and caveats.",
              link: "/features",
              tag: "Deliverables",
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-6 flex flex-col justify-between hover:shadow-md hover:border-[#226192] transition-all duration-200 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#226192] text-white flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5 text-[#A9B887]" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EAE6DE] text-[#5B5245] uppercase tracking-wider">
                      {feat.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#133857] group-hover:text-[#226192] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#5B5245] leading-relaxed">{feat.desc}</p>
                </div>

                <div className="pt-6">
                  <Link
                    to={feat.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#226192] group-hover:text-[#1B4F77]"
                  >
                    <span>Explore details</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION E: HOW IT WORKS PREVIEW                           */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#226192]">
                Streamlined Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133857] uppercase">
                From Raw Data To <span className="text-[#226192]">Clear Answers</span>
              </h2>
            </div>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#226192] hover:text-[#1B4F77] group"
            >
              <span>See full 7-step guide</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {[
              {
                step: "01",
                title: "Upload",
                desc: "Drop your CSV, Excel, or JSON. Files are stored securely in MongoDB.",
              },
              {
                step: "02",
                title: "Profile",
                desc: "Automated scanner computes nulls, duplicates, and column metrics.",
              },
              {
                step: "03",
                title: "Clean",
                desc: "Handle missing values, cast data types, and preview transformations.",
              },
              {
                step: "04",
                title: "Ask AI",
                desc: "Ask questions in natural language. Gemini computes verified answers.",
              },
              {
                step: "05",
                title: "Export",
                desc: "Download cleaned dataset CSV or print comprehensive PDF reports.",
              },
            ].map((st, i) => (
              <div
                key={i}
                className="bg-[#EAE6DE]/50 border border-[#DAD3C6] rounded-2xl p-5 space-y-3 relative group hover:bg-[#FAF8F5] hover:border-[#226192] transition-colors"
              >
                <div className="text-2xl font-black text-[#A9B887] group-hover:text-[#226192] transition-colors">
                  {st.step}
                </div>
                <h4 className="text-sm font-bold text-[#133857]">{st.title}</h4>
                <p className="text-xs text-[#5B5245] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION F: INTERACTIVE PRODUCT DEMONSTRATION              */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#226192]">
            Interactive Showcase
          </span>
          <h2 className="text-3xl font-extrabold text-[#133857] uppercase">
            Experience The <span className="text-[#226192]">Workspace</span>
          </h2>
          <p className="text-xs text-[#5B5245]">
            Switch between core views to see how DataAgent AI structures analytics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#EAE6DE] border border-[#DAD3C6] gap-1 flex-wrap justify-center">
            {[
              { id: "overview", label: "Executive Overview", icon: Eye },
              { id: "cleaning", label: "Data Cleaning Studio", icon: SlidersHorizontal },
              { id: "visuals", label: "Visualizations", icon: BarChart3 },
              { id: "ai", label: "AI Analyst Q&A", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#226192] text-white shadow-xs"
                      : "text-[#5B5245] hover:text-[#133857] hover:bg-[#FAF8F5]/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-6 sm:p-8 shadow-sm">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#DAD3C6] pb-4">
                <div>
                  <h4 className="text-base font-bold text-[#133857]">Active File: retail_sales_2025.csv</h4>
                  <p className="text-xs text-[#5B5245]">152 verified records • 14 columns • 99/100 Quality Score</p>
                </div>
                <span className="text-xs font-mono px-3 py-1 bg-[#A9B887]/20 text-[#6F804F] rounded-full font-bold">
                  Live Synced
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DAD3C6]">
                  <span className="text-[11px] text-[#5B5245] font-semibold">Total Revenue</span>
                  <div className="text-2xl font-bold text-[#133857] mt-1">$84,113</div>
                  <span className="text-[10px] text-[#6F804F] font-semibold">↑ 18% vs avg</span>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DAD3C6]">
                  <span className="text-[11px] text-[#5B5245] font-semibold">Total Profit</span>
                  <div className="text-2xl font-bold text-[#133857] mt-1">$24,957</div>
                  <span className="text-[10px] text-[#226192] font-semibold">29.7% margin</span>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DAD3C6]">
                  <span className="text-[11px] text-[#5B5245] font-semibold">Clean Records</span>
                  <div className="text-2xl font-bold text-[#133857] mt-1">150 Unique</div>
                  <span className="text-[10px] text-[#5B5245]">2 duplicates purged</span>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DAD3C6]">
                  <span className="text-[11px] text-[#5B5245] font-semibold">Product Catalog</span>
                  <div className="text-2xl font-bold text-[#133857] mt-1">11 SKUs</div>
                  <span className="text-[10px] text-[#5B5245]">Across 5 categories</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "cleaning" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DAD3C6] pb-3">
                <h4 className="text-base font-bold text-[#133857]">Interactive Cleaning Preview</h4>
                <span className="text-xs text-[#226192] font-semibold">Preview Mode Active</span>
              </div>
              <div className="bg-[#FAF8F5] rounded-xl border border-[#DAD3C6] p-4 font-mono text-xs space-y-2">
                <div className="text-[#6F804F] font-bold">✓ Operation: Deduplicate rows by Order_ID</div>
                <div className="text-[#5B5245]">→ Rows before: 152 | Rows after: 150 (2 duplicate records removed)</div>
                <div className="text-[#6F804F] font-bold">✓ Operation: Impute missing Customer_Segment</div>
                <div className="text-[#5B5245]">→ 3 missing values filled with mode ("Consumer")</div>
              </div>
            </div>
          )}

          {activeTab === "visuals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#DAD3C6] pb-3">
                <h4 className="text-base font-bold text-[#133857]">Revenue by Category Distribution</h4>
                <span className="text-xs text-[#5B5245]">Aggregated: SUM(Revenue)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { name: "Furniture", val: "$41,552", pct: "49.4%", color: "bg-[#226192]" },
                  { name: "Electronics", val: "$24,831", pct: "29.5%", color: "bg-[#3884BE]" },
                  { name: "Accessories", val: "$14,106", pct: "16.8%", color: "bg-[#A9B887]" },
                  { name: "Office", val: "$3,622", pct: "4.3%", color: "bg-[#6F804F]" },
                ].map((cat, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-[#DAD3C6] bg-[#FAF8F5] space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#133857]">
                      <span>{cat.name}</span>
                      <span>{cat.pct}</span>
                    </div>
                    <div className="w-full bg-[#EAE6DE] h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: cat.pct }} />
                    </div>
                    <div className="text-sm font-bold text-[#133857]">{cat.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#226192]/10 border border-[#226192]/20 text-xs text-[#133857] font-semibold">
                User: "Kis product ne jyada revenue diya aur kitna profit hua?"
              </div>
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#DAD3C6] text-xs text-[#133857] leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#226192]">
                  <Sparkles className="w-4 h-4 text-[#A9B887]" />
                  <span>DataAgent AI (Grounded Response)</span>
                </div>
                <p>
                  Sabse jyada revenue <strong>MacBook Pro</strong> ne generate kiya hai!
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#5B5245]">
                  <li>
                    <strong>Total Revenue:</strong> $45,000 (Across all transactions)
                  </li>
                  <li>
                    <strong>Total Profit:</strong> $13,500 (Net margin ~30.0%)
                  </li>
                  <li>
                    <strong>Units Sold:</strong> 25 units at an average price of $1,800
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION G: TECHNOLOGY HIGHLIGHT                           */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#226192]">
              Under The Hood
            </span>
            <h2 className="text-3xl font-extrabold text-[#133857] uppercase">
              AI Reasoning Meets <span className="text-[#226192]">Deterministic Math</span>
            </h2>
            <p className="text-xs text-[#5B5245] leading-relaxed">
              We separate computational execution from language explanation. Python mathematical
              libraries calculate the exact numbers; Google Gemini translates them into actionable insights.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                tech: "Python & Pandas",
                role: "High-performance tabular computation, groupbys & statistical aggregations.",
              },
              {
                tech: "FastAPI Engine",
                role: "Asynchronous backend validation, streaming CSV exports & REST endpoints.",
              },
              {
                tech: "Plotly.js",
                role: "Client-side responsive charting for distributions, trends, and scatter plots.",
              },
              {
                tech: "MongoDB Native",
                role: "Direct document storage for dataset records, original snapshots & chat history.",
              },
            ].map((st, i) => (
              <div key={i} className="p-5 rounded-2xl bg-[#EAE6DE]/40 border border-[#DAD3C6] space-y-2">
                <h4 className="text-sm font-bold text-[#133857]">{st.tech}</h4>
                <p className="text-xs text-[#5B5245] leading-relaxed">{st.role}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/technology"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#226192] hover:text-[#1B4F77]"
            >
              <span>Explore full architectural specifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION H: FINAL CTA                                      */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#226192] text-white p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-xl shadow-[#226192]/20">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#A9B887]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#3884BE]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-3 relative z-10">
            <span className="text-xs font-bold tracking-widest uppercase text-[#A9B887]">
              Start Analyzing Now
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
              Your Next Insight Is <br />
              Already In Your Data.
            </h2>
            <p className="text-sm sm:text-base text-[#EAE6DE] font-normal leading-relaxed">
              Bring your dataset. Ask better questions. Discover what matters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 relative z-10">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-[#133857] hover:bg-[#FAF8F5] font-bold text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#1B4F77] hover:bg-[#133857] text-white font-semibold text-sm border border-white/20 transition-all duration-200"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Heart,
  Target,
  Compass,
  Lightbulb,
} from "lucide-react";

export const AboutPage: React.FC = () => {
  const principles = [
    {
      num: "01",
      title: "Accuracy Over Artificial Confidence",
      desc: "We believe an AI agent should never guess numbers to appear smart. If a column is missing or an aggregation cannot be computed, DataAgent AI tells you directly rather than hallucinating plausible-sounding statistics.",
    },
    {
      num: "02",
      title: "Transparency Over Black-Box Answers",
      desc: "Every answer, chart, and KPI is tied to an explicit analytical plan. You can always inspect the underlying rows, view the transformation log, and verify the formulas used.",
    },
    {
      num: "03",
      title: "Useful Automation With User Control",
      desc: "We automate tedious diagnostic scanning, null detection, and chart layout generation, but destructive transformations (such as dropping records or imputing values) always require your review and authorization.",
    },
    {
      num: "04",
      title: "Simplicity Without Sacrificing Depth",
      desc: "Data analysis should not require years of Python or SQL syntax practice. We make complex statistical modeling, correlation matrices, and time-series trends accessible to anyone who can ask a question.",
    },
  ];

  return (
    <div className="space-y-24 py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE6DE] border border-[#DAD3C6] text-[#226192] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#A9B887]" />
          <span>Product Mission</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#133857] uppercase tracking-tight leading-tight">
          Making Data Analysis <br />
          <span className="text-[#226192]">Truly Accessible.</span>
        </h1>
        <p className="text-base text-[#5B5245] leading-relaxed max-w-2xl mx-auto">
          You shouldn't need to become an expert programmer just to understand the data you already
          possess. DataAgent AI unites reliable mathematical computation with conversational natural language.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#226192] hover:bg-[#1B4F77] text-white text-xs font-bold shadow-md shadow-[#226192]/20 transition-all group"
          >
            <span>Experience The Platform</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#226192]">
              The Core Problem
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#133857] uppercase">
              The Divide Between Raw Data and Real Insights
            </h2>
            <p className="text-xs sm:text-sm text-[#5B5245] leading-relaxed">
              Every day, millions of people collect valuable data in spreadsheets: sales records,
              scientific observations, survey answers, customer metrics. But turning those rows into
              trustworthy conclusions usually requires knowing complex BI software or writing custom code.
            </p>
            <p className="text-xs sm:text-sm text-[#5B5245] leading-relaxed">
              Meanwhile, conventional AI chatbots are unreliable for arithmetic—they frequently hallucinate
              totals, invent percentages, and make unsupported claims. DataAgent AI was built to solve this
              exact dilemma.
            </p>
          </div>

          <div className="bg-[#EAE6DE]/50 border border-[#DAD3C6] rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-[#133857] uppercase tracking-wider">
              What Sets DataAgent AI Apart:
            </h4>
            <ul className="space-y-3 text-xs text-[#133857]">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Strict Computational Division:</strong> Math is handled by Pandas/NumPy;
                  natural language explanation is handled by Gemini 3.5 Flash.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Active File Synchronization:</strong> The entire workspace—KPIs, charts,
                  and AI conversations—adapts strictly to your active dataset.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#6F804F] flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Safety First:</strong> Zero arbitrary code execution in user containers;
                  approved analytical operations only.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4 Core Principles */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#226192]">
            Foundational Tenets
          </span>
          <h2 className="text-3xl font-extrabold text-[#133857] uppercase">
            Our Four Product Principles
          </h2>
          <p className="text-xs text-[#5B5245]">
            Every capability in DataAgent AI is designed according to these four rules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {principles.map((p, idx) => (
            <div
              key={idx}
              className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-6 sm:p-8 space-y-3 hover:border-[#226192] transition-colors shadow-2xs"
            >
              <div className="text-3xl font-black text-[#A9B887]">{p.num}</div>
              <h3 className="text-base font-bold text-[#133857]">{p.title}</h3>
              <p className="text-xs text-[#5B5245] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Development Philosophy */}
      <section className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#226192] text-white flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5 text-[#A9B887]" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#133857] uppercase">
              Designed For Real-World Workflows
            </h3>
            <p className="text-xs text-[#5B5245]">Built for students, researchers, analysts, and founders.</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5B5245] leading-relaxed">
          Whether you are preparing a classroom project, analyzing quarterly e-commerce revenue,
          or auditing patient survey datasets, DataAgent AI gives you verified clarity without
          requiring you to write boilerplate data-cleaning code.
        </p>
      </section>

      {/* Bottom CTA */}
      <section className="text-center pt-6">
        <div className="p-10 sm:p-14 rounded-3xl bg-[#226192] text-white space-y-6 max-w-4xl mx-auto shadow-xl shadow-[#226192]/20">
          <h2 className="text-3xl sm:text-4xl font-black uppercase">
            Ready To Explore Your Data?
          </h2>
          <p className="text-sm text-[#EAE6DE] max-w-xl mx-auto">
            Get started right now. Upload your dataset or load our retail sales demo to explore insights in seconds.
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

import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Database, ShieldCheck, Cpu, BarChart3 } from "lucide-react";

export const MarketingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FAF8F5] border-t border-[#DAD3C6] text-[#133857] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#226192] flex items-center justify-center text-[#FAF8F5] shadow-xs">
                <Sparkles className="w-4 h-4 text-[#A9B887]" />
              </div>
              <span className="font-bold text-[#133857] tracking-tight text-base">
                DataAgent <span className="text-[#226192]">AI</span>
              </span>
            </Link>
            <p className="text-xs text-[#5B5245] leading-relaxed">
              An evidence-based analytics platform that converts raw datasets into verified calculations,
              interactive charts, and meaningful insights.
            </p>
            <div className="pt-1">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#226192] hover:text-[#1B4F77] group"
              >
                <span>Open Product Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-[#133857] uppercase tracking-wider mb-3">
              Explore Pages
            </h4>
            <ul className="space-y-2 text-xs text-[#5B5245]">
              <li>
                <Link to="/" className="hover:text-[#226192] transition-colors">
                  Product Overview
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-[#226192] transition-colors">
                  Features & Tools
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-[#226192] transition-colors">
                  How It Works (7 Steps)
                </Link>
              </li>
              <li>
                <Link to="/technology" className="hover:text-[#226192] transition-colors">
                  Architecture & Stack
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#226192] transition-colors">
                  About the Vision
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Engine Capabilities */}
          <div>
            <h4 className="text-xs font-bold text-[#133857] uppercase tracking-wider mb-3">
              Analytics Capabilities
            </h4>
            <ul className="space-y-2 text-xs text-[#5B5245]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887]" />
                <span>Deterministic Pandas & NumPy Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887]" />
                <span>Automated Data Quality Profiling</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887]" />
                <span>Plotly Interactive Visualizations</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887]" />
                <span>Gemini 3.5 Flash Natural Language AI</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887]" />
                <span>100% MongoDB-Native Storage</span>
              </li>
            </ul>
          </div>

          {/* Reliability Statement */}
          <div className="bg-[#EAE6DE]/50 border border-[#DAD3C6] p-4 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#133857]">
              <ShieldCheck className="w-4 h-4 text-[#226192]" />
              <span>Grounded Calculations</span>
            </div>
            <p className="text-[11px] text-[#5B5245] leading-relaxed">
              Every numerical claim, trend, and summary is computed by backend mathematical libraries.
              The AI interprets verified results without fabricating numbers.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#DAD3C6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5B5245]">
          <p>© {currentYear} DataAgent AI. Turn Raw Data Into Meaningful Insights.</p>
          <p className="font-medium text-[#133857]">Your Data. Your Questions. Clear Answers.</p>
        </div>
      </div>
    </footer>
  );
};

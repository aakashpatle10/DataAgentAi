import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  FileCheck2,
  Download,
  FileText,
  CheckCircle2,
  Database,
  Sparkles,
  ShieldCheck,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";

import { useActiveDataset } from "@/hooks/useActiveDataset";
import { reportsApi } from "@/services/api/reportsApi";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatBytes } from "@/lib/utils";
import { ReportGenerateRequest, ReportMeta } from "@/types";

export const ReportsPage: React.FC = () => {
  const { activeDataset, activeDatasetId } = useActiveDataset();

  // Report section checkboxes
  const [reportTitle, setReportTitle] = useState(
    "DataAgent AI — Comprehensive Analysis Report"
  );
  const [includeOverview, setIncludeOverview] = useState(true);
  const [includeQuality, setIncludeQuality] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [includeCorrs, setIncludeCorrs] = useState(true);
  const [includeTx, setIncludeTx] = useState(true);

  const [generatedReport, setGeneratedReport] = useState<ReportMeta | null>(null);

  const reportMutation = useMutation({
    mutationFn: (req: ReportGenerateRequest) => reportsApi.generate(activeDatasetId!, req),
    onSuccess: (data) => {
      setGeneratedReport(data);
    },
  });

  if (!activeDatasetId || !activeDataset) {
    return (
      <EmptyState
        icon={Database}
        title="No Dataset Selected"
        description="Select or upload a dataset to generate a professional vector PDF analysis report."
      />
    );
  }

  const handleGenerate = () => {
    reportMutation.mutate({
      title: reportTitle,
      include_overview: includeOverview,
      include_quality: includeQuality,
      include_descriptive_stats: includeStats,
      include_correlations: includeCorrs,
      include_transformations: includeTx,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#133857] tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#226192]" />
            Executive Report Generator
          </h2>
          <p className="text-xs text-[#5B5245] mt-0.5">
            Export publication-ready vector PDF reports with custom sections, statistics, and audit trails.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DAD3C6] text-xs text-[#133857]">
          <span className="font-semibold">{activeDataset.name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887]" />
          <span className="text-[#5B5245]">PDF Engine: ReportLab</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Configuration Form */}
        <Card className="md:col-span-2 space-y-4">
          <CardHeader>
            <CardTitle>Report Customization</CardTitle>
          </CardHeader>

          <div>
            <label className="text-xs font-semibold text-[#133857] block mb-1">Report Document Title</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
            />
          </div>

          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-semibold text-[#133857] block mb-2">Sections to Include:</span>

            {[
              { label: "1. Executive Dataset Overview", desc: "Total records, memory footprint, data types, and quality rating score.", checked: includeOverview, setter: setIncludeOverview, icon: Database },
              { label: "2. Data Quality & Integrity Diagnostics", desc: "Missing values, duplicate detection, and anomalous column warnings.", checked: includeQuality, setter: setIncludeQuality, icon: ShieldCheck },
              { label: "3. Descriptive Statistics Summary", desc: "Means, standard deviations, minimums, medians, and maximum distributions.", checked: includeStats, setter: setIncludeStats, icon: BarChart3 },
              { label: "4. Statistical Correlation Highlights", desc: "Top pairwise Pearson correlation coefficients and association metrics.", checked: includeCorrs, setter: setIncludeCorrs, icon: Sparkles },
              { label: "5. Transformation & Cleaning Audit Trail", desc: "Sequential log of all applied deduplications, imputations, and filters.", checked: includeTx, setter: setIncludeTx, icon: SlidersHorizontal },
            ].map((section, idx) => {
              const Icon = section.icon;
              return (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    section.checked
                      ? "bg-[#226192]/10 border-[#226192] text-[#133857]"
                      : "bg-[#FAF8F5] border-[#DAD3C6] text-[#5B5245] hover:bg-[#EAE6DE]/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={section.checked}
                    onChange={(e) => section.setter(e.target.checked)}
                    className="rounded border-[#DAD3C6] text-[#226192] focus:ring-[#226192] mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-1.5 text-[#133857]">
                      <Icon className="w-3.5 h-3.5 text-[#226192]" />
                      {section.label}
                    </div>
                    <div className="text-[11px] text-[#5B5245] mt-0.5 leading-snug">{section.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#DAD3C6] flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={handleGenerate}
              isLoading={reportMutation.isPending}
            >
              <FileCheck2 className="w-4 h-4 mr-1.5" /> Generate PDF Report
            </Button>
          </div>
        </Card>

        {/* Right: Output / Download Panel */}
        <div className="space-y-4">
          <Card className="text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#226192]/10 text-[#226192] flex items-center justify-center mx-auto shadow-2xs">
              <FileText className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#133857]">PDF Report Output</h4>
              <p className="text-xs text-[#5B5245] mt-1 leading-snug">
                Compiled vector PDF with professional typography and formatting.
              </p>
            </div>

            {generatedReport ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-[#A9B887]/20 rounded-xl border border-[#A9B887] text-xs text-[#133857] text-left space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#6F804F]">
                    <CheckCircle2 className="w-4 h-4 text-[#A9B887]" />
                    Report Generated Successfully!
                  </div>
                  <div className="text-[11px] text-[#5B5245]">
                    Size: {formatBytes(generatedReport.file_size_bytes)}
                  </div>
                </div>

                <a
                  href={reportsApi.getDownloadUrl(generatedReport.id)}
                  download
                  className="w-full inline-flex items-center justify-center font-semibold rounded-xl text-xs px-4 py-2.5 bg-[#226192] hover:bg-[#1B4F77] text-[#FAF8F5] shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2 text-[#A9B887]" /> Download PDF Report
                </a>
              </div>
            ) : (
              <div className="p-4 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6] text-xs text-[#5B5245]">
                Click "Generate PDF Report" on the left to compile your report.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

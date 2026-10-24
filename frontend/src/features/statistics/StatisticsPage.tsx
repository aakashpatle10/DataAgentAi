import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  TrendingUp,
  Activity,
  Layers,
  Search,
  AlertTriangle,
  Database,
  ArrowRight,
  LineChart,
  CheckCircle2,
  Table,
} from "lucide-react";

import { useActiveDataset } from "@/hooks/useActiveDataset";
import { statisticsApi } from "@/services/api/statisticsApi";
import { queryKeys } from "@/services/api/queryKeys";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlotlyChart } from "@/components/charts/PlotlyChart";
import { formatNumber } from "@/lib/utils";

export const StatisticsPage: React.FC = () => {
  const { activeDataset, activeDatasetId } = useActiveDataset();

  // Sub-tab selection
  const [activeTab, setActiveTab] = useState<"descriptive" | "correlations" | "outliers" | "grouping" | "regression">("descriptive");

  // Outlier target column
  const [outlierCol, setOutlierCol] = useState<string>("");

  // Group analysis state
  const [groupByCol, setGroupByCol] = useState<string>("");
  const [metricCol, setMetricCol] = useState<string>("");

  // Regression state
  const [regX, setRegX] = useState<string>("");
  const [regY, setRegY] = useState<string>("");

  // 1. Descriptive stats query
  const { data: stats = [], isLoading: isLoadingStats } = useQuery({
    queryKey: queryKeys.statistics(activeDatasetId || ""),
    queryFn: () => statisticsApi.getStats(activeDatasetId!),
    enabled: !!activeDatasetId && activeTab === "descriptive",
  });

  // 2. Correlations query
  const { data: correlations, isLoading: isLoadingCorrs } = useQuery({
    queryKey: queryKeys.correlations(activeDatasetId || ""),
    queryFn: () => statisticsApi.getCorrelations(activeDatasetId!),
    enabled: !!activeDatasetId && activeTab === "correlations",
  });

  // 3. Outliers query
  const { data: outlierReport, isLoading: isLoadingOutliers } = useQuery({
    queryKey: queryKeys.outliers(activeDatasetId || "", outlierCol),
    queryFn: () => statisticsApi.getOutliers(activeDatasetId!, outlierCol || undefined),
    enabled: !!activeDatasetId && activeTab === "outliers",
  });

  // 4. Group analysis mutation
  const groupMutation = useMutation({
    mutationFn: () => statisticsApi.getGroupAnalysis(activeDatasetId!, groupByCol, metricCol),
  });

  // 5. Regression mutation
  const regressionMutation = useMutation({
    mutationFn: () => statisticsApi.getRegression(activeDatasetId!, regX, regY),
  });

  if (!activeDatasetId || !activeDataset) {
    return (
      <EmptyState
        icon={Database}
        title="No Dataset Selected"
        description="Select or upload a dataset to compute descriptive statistics, correlation heatmaps, and outlier diagnostics."
      />
    );
  }

  const columns = activeDataset.columns;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#133857] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#226192]" />
            Statistical Analysis Engine
          </h2>
          <p className="text-xs text-[#5B5245] mt-0.5">
            Rigorous mathematical computations powered by NumPy, SciPy, and Pandas.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DAD3C6] text-xs text-[#133857]">
          <span className="font-semibold">{activeDataset.name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887]" />
          <span className="text-[#5B5245]">{activeDataset.row_count.toLocaleString()} observations</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#DAD3C6] pb-3">
        {[
          { id: "descriptive", label: "Descriptive Statistics" },
          { id: "correlations", label: "Correlation Matrix" },
          { id: "outliers", label: "Tukey Outlier Review" },
          { id: "grouping", label: "Grouped Aggregations" },
          { id: "regression", label: "Linear Regression" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#226192] text-[#FAF8F5] shadow-xs"
                : "bg-[#FAF8F5] text-[#5B5245] hover:text-[#133857] hover:bg-[#EAE6DE] border border-[#DAD3C6]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Descriptive Statistics */}
      {activeTab === "descriptive" && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#133857]">
              <thead className="bg-[#EAE6DE] text-[#133857] font-semibold uppercase tracking-wider border-b border-[#DAD3C6]">
                <tr>
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Count</th>
                  <th className="px-4 py-3">Mean</th>
                  <th className="px-4 py-3">Median</th>
                  <th className="px-4 py-3">Std Dev</th>
                  <th className="px-4 py-3">Min</th>
                  <th className="px-4 py-3">Q25</th>
                  <th className="px-4 py-3">Q75</th>
                  <th className="px-4 py-3">Max</th>
                  <th className="px-4 py-3">Skewness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DAD3C6]/60 bg-[#FAF8F5]">
                {isLoadingStats ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-[#5B5245]">
                      Computing descriptive distributions...
                    </td>
                  </tr>
                ) : stats.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-[#5B5245]">
                      No numeric columns detected in dataset.
                    </td>
                  </tr>
                ) : (
                  stats.map((s) => (
                    <tr key={s.column} className="hover:bg-[#EAE6DE]/30 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-[#133857] whitespace-nowrap">{s.column}</td>
                      <td className="px-4 py-2.5 text-[#5B5245] font-mono">{s.count}</td>
                      <td className="px-4 py-2.5 font-mono">{formatNumber(s.mean)}</td>
                      <td className="px-4 py-2.5 font-mono">{formatNumber(s.median)}</td>
                      <td className="px-4 py-2.5 font-mono">{formatNumber(s.std)}</td>
                      <td className="px-4 py-2.5 font-mono">{formatNumber(s.min)}</td>
                      <td className="px-4 py-2.5 font-mono">{formatNumber(s.q25)}</td>
                      <td className="px-4 py-2.5 font-mono">{formatNumber(s.q75)}</td>
                      <td className="px-4 py-2.5 font-mono">{formatNumber(s.max)}</td>
                      <td className="px-4 py-2.5 font-mono">{formatNumber(s.skewness)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 2. Correlations */}
      {activeTab === "correlations" && (
        <div className="space-y-6">
          {correlations ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Heatmap */}
              <Card>
                <CardHeader>
                  <CardTitle>Pearson Correlation Heatmap</CardTitle>
                </CardHeader>
                <PlotlyChart
                  data={[
                    {
                      type: "heatmap",
                      z: correlations.pearson_matrix,
                      x: correlations.columns,
                      y: correlations.columns,
                      colorscale: [
                        [0, "#EAE6DE"],
                        [0.5, "#A9B887"],
                        [1, "#226192"],
                      ],
                      zmin: -1,
                      zmax: 1,
                    },
                  ]}
                  layout={{
                    margin: { l: 80, r: 20, t: 30, b: 80 },
                  }}
                  className="w-full h-80"
                />
              </Card>

              {/* Strongest Pairs */}
              <Card>
                <CardHeader>
                  <CardTitle>Strongest Feature Relationships</CardTitle>
                </CardHeader>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {correlations.top_correlations.map((pair, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#EAE6DE]/40 rounded-xl border border-[#DAD3C6] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-[#133857]">
                          {pair.column_x} ↔ {pair.column_y}
                        </div>
                        <div className="text-[10px] text-[#5B5245] mt-0.5">
                          Relationship: <b className="text-[#133857]">{pair.relationship}</b>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-[#226192] bg-[#226192]/10 px-2.5 py-1 rounded-lg border border-[#226192]/20">
                          r = {pair.pearson_r}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6] text-[#133857] text-[11px] leading-relaxed">
                  ℹ️ {correlations.caution_note}
                </div>
              </Card>
            </div>
          ) : (
            <div className="p-8 text-center text-[#5B5245] text-xs">
              Calculating correlation matrices...
            </div>
          )}
        </div>
      )}

      {/* 3. Outlier Review */}
      {activeTab === "outliers" && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-[#133857]">Tukey's IQR Outlier Detection</h4>
                <p className="text-xs text-[#5B5245]">
                  Flags values that fall beyond Q1 - 1.5*IQR or Q3 + 1.5*IQR as statistical candidates.
                </p>
              </div>

              {/* Column selector */}
              <select
                value={outlierCol}
                onChange={(e) => setOutlierCol(e.target.value)}
                className="text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] w-52 focus:outline-none focus:border-[#226192]"
              >
                <option value="">Default Numeric Column</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {outlierReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6]">
                    <span className="text-[#5B5245] block font-medium">Outlier Count</span>
                    <span className="text-lg font-bold text-[#226192]">
                      {outlierReport.outlier_count} ({outlierReport.outlier_percentage}%)
                    </span>
                  </div>
                  <div className="p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6]">
                    <span className="text-[#5B5245] block font-medium">IQR</span>
                    <span className="text-lg font-bold text-[#133857]">{outlierReport.iqr}</span>
                  </div>
                  <div className="p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6]">
                    <span className="text-[#5B5245] block font-medium">Lower Threshold</span>
                    <span className="text-lg font-bold text-[#133857]">{outlierReport.lower_threshold}</span>
                  </div>
                  <div className="p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6]">
                    <span className="text-[#5B5245] block font-medium">Upper Threshold</span>
                    <span className="text-lg font-bold text-[#133857]">{outlierReport.upper_threshold}</span>
                  </div>
                </div>

                {outlierReport.candidates_preview.length > 0 ? (
                  <div>
                    <h5 className="text-xs font-semibold text-[#133857] mb-2">Candidate Outlier Records:</h5>
                    <div className="border border-[#DAD3C6] rounded-xl overflow-x-auto max-h-56 bg-[#FAF8F5]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#EAE6DE] text-[#133857] border-b border-[#DAD3C6] font-semibold">
                          <tr>
                            {Object.keys(outlierReport.candidates_preview[0] || {}).map((k) => (
                              <th key={k} className="px-3 py-2 whitespace-nowrap">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DAD3C6]/60">
                          {outlierReport.candidates_preview.map((r, i) => (
                            <tr key={i} className="hover:bg-[#EAE6DE]/30 transition-colors">
                              {Object.values(r).map((v: any, j) => (
                                <td key={j} className="px-3 py-1.5 whitespace-nowrap text-[#133857]">{String(v ?? "NULL")}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#5B5245] bg-[#EAE6DE]/30 rounded-xl border border-[#DAD3C6]">
                    No records fell beyond the 1.5x IQR boundary for this column.
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 4. Grouped Analysis */}
      {activeTab === "grouping" && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Categorical Group Aggregation</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#133857] block mb-1">Group By (Categorical)</label>
              <select
                value={groupByCol}
                onChange={(e) => setGroupByCol(e.target.value)}
                className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
              >
                <option value="">Select column...</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#133857] block mb-1">Metric Column (Numeric)</label>
              <select
                value={metricCol}
                onChange={(e) => setMetricCol(e.target.value)}
                className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
              >
                <option value="">Select column...</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => groupMutation.mutate()}
            disabled={!groupByCol || !metricCol || groupMutation.isPending}
            isLoading={groupMutation.isPending}
          >
            Compute Group Aggregations
          </Button>

          {groupMutation.data && (
            <div className="border border-[#DAD3C6] rounded-xl overflow-x-auto mt-4 bg-[#FAF8F5]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EAE6DE] text-[#133857] font-semibold border-b border-[#DAD3C6]">
                  <tr>
                    <th className="px-4 py-2.5">Category Group</th>
                    <th className="px-4 py-2.5">Records</th>
                    <th className="px-4 py-2.5">Sum</th>
                    <th className="px-4 py-2.5">Mean</th>
                    <th className="px-4 py-2.5">Median</th>
                    <th className="px-4 py-2.5">Min</th>
                    <th className="px-4 py-2.5">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DAD3C6]/60">
                  {groupMutation.data.results.map((r, i) => (
                    <tr key={i} className="hover:bg-[#EAE6DE]/30 transition-colors">
                      <td className="px-4 py-2 font-semibold text-[#133857]">{r.group}</td>
                      <td className="px-4 py-2 text-[#5B5245]">{r.count}</td>
                      <td className="px-4 py-2 font-mono text-[#133857]">{formatNumber(r.sum)}</td>
                      <td className="px-4 py-2 font-mono text-[#133857]">{formatNumber(r.mean)}</td>
                      <td className="px-4 py-2 font-mono text-[#133857]">{formatNumber(r.median)}</td>
                      <td className="px-4 py-2 font-mono text-[#133857]">{formatNumber(r.min)}</td>
                      <td className="px-4 py-2 font-mono text-[#133857]">{formatNumber(r.max)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* 5. Linear Regression */}
      {activeTab === "regression" && (
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Bivariate Linear Regression</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#133857] block mb-1">Independent Variable (X)</label>
              <select
                value={regX}
                onChange={(e) => setRegX(e.target.value)}
                className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
              >
                <option value="">Select X Column...</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#133857] block mb-1">Dependent Variable (Y)</label>
              <select
                value={regY}
                onChange={(e) => setRegY(e.target.value)}
                className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
              >
                <option value="">Select Y Column...</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => regressionMutation.mutate()}
            disabled={!regX || !regY || regressionMutation.isPending}
            isLoading={regressionMutation.isPending}
          >
            Fit Regression Model
          </Button>

          {regressionMutation.data && (
            <div className="p-4 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6] space-y-2 text-xs">
              <div className="font-mono text-sm font-bold text-[#226192]">
                Formula: {regressionMutation.data.formula}
              </div>
              <div className="grid grid-cols-3 gap-2 py-2">
                <div><span className="text-[#5B5245] block font-medium">R² Score:</span> <b className="text-[#133857]">{regressionMutation.data.r_squared}</b></div>
                <div><span className="text-[#5B5245] block font-medium">Slope:</span> <b className="text-[#133857]">{regressionMutation.data.slope}</b></div>
                <div><span className="text-[#5B5245] block font-medium">p-value:</span> <b className="text-[#133857]">{regressionMutation.data.p_value}</b></div>
              </div>
              <p className="text-[#133857] leading-relaxed">{regressionMutation.data.interpretation}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

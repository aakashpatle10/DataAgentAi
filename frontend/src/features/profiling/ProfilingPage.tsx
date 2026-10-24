import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Hash,
  Type,
  Calendar,
  Layers,
  Database,
  Info,
  SlidersHorizontal,
  Activity,
} from "lucide-react";

import { useActiveDataset } from "@/hooks/useActiveDataset";
import { profilingApi } from "@/services/api/profilingApi";
import { queryKeys } from "@/services/api/queryKeys";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatNumber } from "@/lib/utils";

export const ProfilingPage: React.FC = () => {
  const { activeDataset, activeDatasetId } = useActiveDataset();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.profile(activeDatasetId || ""),
    queryFn: () => profilingApi.getProfile(activeDatasetId!),
    enabled: !!activeDatasetId,
  });

  if (!activeDatasetId || !activeDataset) {
    return (
      <EmptyState
        icon={Database}
        title="No Dataset Selected"
        description="Please select or upload a dataset to generate full automated profiling and data-quality diagnostics."
      />
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center p-16 text-[#5B5245] text-sm bg-[#FAF8F5] rounded-2xl border border-[#DAD3C6]">
        <Activity className="w-5 h-5 text-[#226192] animate-spin mr-3" />
        Profiling dataset attributes and calculating statistical distributions...
      </div>
    );
  }

  // Filter columns by category
  const filteredColumns = Object.values(profile.columns).filter((col) => {
    if (typeFilter === "all") return true;
    return col.category === typeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#133857] tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#226192]" />
            Data Profiling & Quality Engine
          </h2>
          <p className="text-xs text-[#5B5245] mt-0.5">
            Automated structural audit, column-level distributions, and heuristic data quality inspection.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DAD3C6] text-xs text-[#133857]">
          <span className="font-semibold">{activeDataset.name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887]" />
          <span className="text-[#5B5245]">{profile.total_rows.toLocaleString()} rows</span>
        </div>
      </div>

      {/* Dataset Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DAD3C6] shadow-xs">
          <div className="text-[11px] text-[#5B5245] font-semibold uppercase tracking-wider mb-1">Rows</div>
          <div className="text-xl font-bold text-[#133857]">{profile.total_rows.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DAD3C6] shadow-xs">
          <div className="text-[11px] text-[#5B5245] font-semibold uppercase tracking-wider mb-1">Columns</div>
          <div className="text-xl font-bold text-[#133857]">{profile.total_columns}</div>
        </div>
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DAD3C6] shadow-xs">
          <div className="text-[11px] text-[#5B5245] font-semibold uppercase tracking-wider mb-1">Memory</div>
          <div className="text-xl font-bold text-[#133857]">{profile.memory_usage_kb} KB</div>
        </div>
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DAD3C6] shadow-xs">
          <div className="text-[11px] text-[#5B5245] font-semibold uppercase tracking-wider mb-1">Missing Cells</div>
          <div className={`text-xl font-bold ${profile.missing_cells_count > 0 ? "text-[#226192]" : "text-[#133857]"}`}>
            {profile.missing_cells_percentage}%
          </div>
        </div>
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DAD3C6] shadow-xs">
          <div className="text-[11px] text-[#5B5245] font-semibold uppercase tracking-wider mb-1">Duplicates</div>
          <div className={`text-xl font-bold ${profile.duplicate_rows_count > 0 ? "text-[#226192]" : "text-[#133857]"}`}>
            {profile.duplicate_rows_count}
          </div>
        </div>
        <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DAD3C6] shadow-xs">
          <div className="text-[11px] text-[#5B5245] font-semibold uppercase tracking-wider mb-1">Quality Score</div>
          <div className="text-xl font-bold text-[#6F804F] flex items-center gap-1.5">
            <span>{profile.quality_score}/100</span>
            <CheckCircle2 className="w-4 h-4 text-[#A9B887]" />
          </div>
        </div>
      </div>

      {/* Quality Issues Feed */}
      {profile.quality_issues.length > 0 && (
        <Card className="border-[#DAD3C6] bg-[#FAF8F5]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#226192]" />
              <CardTitle className="text-[#133857]">Detected Quality & Anomaly Diagnostics</CardTitle>
            </div>
            <span className="text-xs text-[#226192] font-semibold bg-[#226192]/10 px-2.5 py-1 rounded-full border border-[#226192]/20">
              {profile.quality_issues.length} flagged issue(s)
            </span>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.quality_issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6] flex items-start gap-3 shadow-2xs"
              >
                {issue.severity === "error" ? (
                  <AlertOctagon className="w-4 h-4 text-[#226192] mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#A9B887] mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#133857]">
                      {issue.column ? `Column '${issue.column}'` : "Dataset Level"}
                    </span>
                    <Badge variant={issue.severity === "error" ? "secondary" : "neutral"} size="sm">
                      {issue.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#5B5245] mt-1 leading-snug">{issue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Column Type Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#DAD3C6] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {["all", "numeric", "categorical", "datetime", "text"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                typeFilter === t
                  ? "bg-[#226192] text-[#FAF8F5] shadow-xs"
                  : "bg-[#FAF8F5] text-[#5B5245] hover:text-[#133857] hover:bg-[#EAE6DE] border border-[#DAD3C6]"
              }`}
            >
              {t} {t === "all" ? `(${profile.total_columns})` : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Column Detail Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredColumns.map((col) => {
          return (
            <Card key={col.name} className="flex flex-col justify-between hover:border-[#226192] transition-colors">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#DAD3C6]">
                  <div className="flex items-center gap-2">
                    {col.category === "numeric" && <Hash className="w-4 h-4 text-[#226192]" />}
                    {col.category === "categorical" && <Layers className="w-4 h-4 text-[#A9B887]" />}
                    {col.category === "datetime" && <Calendar className="w-4 h-4 text-[#226192]" />}
                    {col.category === "text" && <Type className="w-4 h-4 text-[#5B5245]" />}
                    <h4 className="font-semibold text-[#133857] text-sm truncate max-w-[170px]" title={col.name}>
                      {col.name}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#EAE6DE] border border-[#DAD3C6] text-[#133857]">
                    {col.dtype}
                  </span>
                </div>

                {/* Numeric Stats */}
                {col.category === "numeric" && col.numeric_stats && (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 bg-[#EAE6DE]/50 p-3 rounded-xl border border-[#DAD3C6]">
                      <div><span className="text-[#5B5245]">Mean:</span> <span className="font-bold text-[#133857] ml-1">{formatNumber(col.numeric_stats.mean)}</span></div>
                      <div><span className="text-[#5B5245]">Median:</span> <span className="font-bold text-[#133857] ml-1">{formatNumber(col.numeric_stats.median)}</span></div>
                      <div><span className="text-[#5B5245]">Min:</span> <span className="font-bold text-[#133857] ml-1">{formatNumber(col.numeric_stats.min)}</span></div>
                      <div><span className="text-[#5B5245]">Max:</span> <span className="font-bold text-[#133857] ml-1">{formatNumber(col.numeric_stats.max)}</span></div>
                      <div><span className="text-[#5B5245]">Std Dev:</span> <span className="font-bold text-[#133857] ml-1">{formatNumber(col.numeric_stats.std)}</span></div>
                      <div><span className="text-[#5B5245]">IQR:</span> <span className="font-bold text-[#133857] ml-1">{formatNumber(col.numeric_stats.iqr)}</span></div>
                    </div>
                    {col.numeric_stats.outlier_count > 0 && (
                      <div className="text-[11px] text-[#133857] bg-[#EAE6DE] p-2 rounded-lg border border-[#DAD3C6] flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#226192] flex-shrink-0" />
                        <span>{col.numeric_stats.outlier_count} outlier candidate(s) via 1.5x IQR</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Categorical Stats */}
                {col.category === "categorical" && col.categorical_stats && (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-[#5B5245] mb-1 font-medium">
                      <span>Unique: <b className="text-[#133857]">{col.categorical_stats.unique_count}</b></span>
                      <span>Cardinality: <b className="text-[#133857]">{Math.round(col.categorical_stats.cardinality * 100)}%</b></span>
                    </div>
                    <div className="space-y-2">
                      {col.categorical_stats.top_values.map((v, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[11px] text-[#133857]">
                            <span className="truncate max-w-[140px] font-medium">{String(v.value)}</span>
                            <span className="text-[#5B5245] font-mono">{v.count} ({v.percentage}%)</span>
                          </div>
                          <div className="w-full bg-[#EAE6DE] rounded-full h-1.5 overflow-hidden border border-[#DAD3C6]">
                            <div className="bg-[#A9B887] h-1.5 rounded-full" style={{ width: `${Math.min(v.percentage, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Datetime Stats */}
                {col.category === "datetime" && col.datetime_stats && (
                  <div className="space-y-2 bg-[#EAE6DE]/50 p-3 rounded-xl text-xs border border-[#DAD3C6]">
                    <div><span className="text-[#5B5245]">Earliest:</span> <span className="font-semibold text-[#133857] ml-1">{col.datetime_stats.min_date || "-"}</span></div>
                    <div><span className="text-[#5B5245]">Latest:</span> <span className="font-semibold text-[#133857] ml-1">{col.datetime_stats.max_date || "-"}</span></div>
                    <div><span className="text-[#5B5245]">Valid Dates:</span> <span className="font-semibold text-[#133857] ml-1">{col.datetime_stats.valid_count}</span></div>
                  </div>
                )}

                {/* Text Stats */}
                {col.category === "text" && col.text_stats && (
                  <div className="space-y-2 bg-[#EAE6DE]/50 p-3 rounded-xl text-xs border border-[#DAD3C6]">
                    <div><span className="text-[#5B5245]">Avg Length:</span> <span className="font-semibold text-[#133857] ml-1">{col.text_stats.avg_length} chars</span></div>
                    <div><span className="text-[#5B5245]">Distinct Values:</span> <span className="font-semibold text-[#133857] ml-1">{col.text_stats.distinct_count}</span></div>
                    <div><span className="text-[#5B5245]">Empty Strings:</span> <span className="font-semibold text-[#133857] ml-1">{col.text_stats.empty_strings_count}</span></div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

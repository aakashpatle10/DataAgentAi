import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  BarChart,
  LineChart,
  PieChart as PieIcon,
  ScatterChart,
  Activity,
  Layers,
  Sparkles,
  Database,
  RefreshCw,
} from "lucide-react";

import { useActiveDataset } from "@/hooks/useActiveDataset";
import { chartsApi } from "@/services/api/chartsApi";
import { queryKeys } from "@/services/api/queryKeys";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlotlyChart } from "@/components/charts/PlotlyChart";
import { ChartConfigRequest, ChartResponse } from "@/types";

export const VisualizationsPage: React.FC = () => {
  const { activeDataset, activeDatasetId } = useActiveDataset();

  // Chart configuration state
  const [chartType, setChartType] = useState<string>("bar");
  const [xCol, setXCol] = useState<string>("");
  const [yCol, setYCol] = useState<string>("");
  const [aggregation, setAggregation] = useState<string>("sum");
  const [chartTitle, setChartTitle] = useState<string>("");

  const [activeChart, setActiveChart] = useState<ChartResponse | null>(null);

  // Recommendations query
  const { data: recommendations = [], isLoading: isLoadingRecs } = useQuery({
    queryKey: queryKeys.chartsRecommend(activeDatasetId || ""),
    queryFn: () => chartsApi.getRecommendations(activeDatasetId!),
    enabled: !!activeDatasetId,
  });

  // Chart generation mutation
  const chartMutation = useMutation({
    mutationFn: (cfg: ChartConfigRequest) => chartsApi.create(activeDatasetId!, cfg),
    onSuccess: (data) => {
      setActiveChart(data);
    },
  });

  if (!activeDatasetId || !activeDataset) {
    return (
      <EmptyState
        icon={Database}
        title="No Dataset Selected"
        description="Select or upload a dataset to generate interactive charts, distribution histograms, and correlation heatmaps."
      />
    );
  }

  const columns = activeDataset.columns;

  const handleGenerate = () => {
    const cfg: ChartConfigRequest = {
      chart_type: chartType,
      x_column: xCol || undefined,
      y_column: yCol || undefined,
      aggregation: chartType === "pie" ? "sum" : aggregation,
      title: chartTitle || undefined,
    };
    chartMutation.mutate(cfg);
  };

  const handleApplyPreset = (cfg: ChartConfigRequest) => {
    setChartType(cfg.chart_type);
    setXCol(cfg.x_column || "");
    setYCol(cfg.y_column || "");
    setAggregation(cfg.aggregation || "none");
    setChartTitle(cfg.title || "");
    chartMutation.mutate(cfg);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#133857] tracking-tight flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-[#226192]" />
            Interactive Visualizations
          </h2>
          <p className="text-xs text-[#5B5245] mt-0.5">
            Build custom Plotly charts, explore multivariate relationships, or launch smart dataset presets.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#DAD3C6] text-xs text-[#133857]">
          <span className="font-semibold">{activeDataset.name}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887]" />
          <span className="text-[#5B5245]">{columns.length} attributes</span>
        </div>
      </div>

      {/* Preset Recommendations Gallery */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#133857]">
            <Sparkles className="w-4 h-4 text-[#A9B887]" />
            Recommended Visual Presets for {activeDataset.name}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec) => (
              <button
                key={rec.id}
                onClick={() => handleApplyPreset(rec.config)}
                className="text-left p-3.5 bg-[#FAF8F5] rounded-xl border border-[#DAD3C6] hover:border-[#226192] hover:shadow-xs transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-[#133857] group-hover:text-[#226192] transition-colors">
                    {rec.title}
                  </h4>
                  <Badge variant="secondary" size="sm" className="uppercase font-mono">
                    {rec.chart_type}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#5B5245] line-clamp-2 leading-relaxed">
                  {rec.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Builder & Canvas Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Builder */}
        <Card className="lg:col-span-1 space-y-4">
          <CardHeader>
            <CardTitle>Chart Configuration</CardTitle>
          </CardHeader>

          {/* Chart Type Selector */}
          <div>
            <label className="text-xs font-semibold text-[#133857] block mb-1.5">Chart Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: "bar", label: "Bar" },
                { id: "line", label: "Line" },
                { id: "scatter", label: "Scatter" },
                { id: "histogram", label: "Histogram" },
                { id: "box", label: "Box" },
                { id: "pie", label: "Pie" },
                { id: "heatmap", label: "Heatmap" },
                { id: "area", label: "Area" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setChartType(t.id)}
                  className={`py-2 px-1 text-center text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    chartType === t.id
                      ? "bg-[#226192] text-[#FAF8F5] shadow-xs"
                      : "bg-[#EAE6DE]/50 text-[#5B5245] hover:text-[#133857] hover:bg-[#EAE6DE] border border-[#DAD3C6]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* X Axis Column */}
          {chartType !== "heatmap" && (
            <div>
              <label className="text-xs font-semibold text-[#133857] block mb-1">
                {chartType === "histogram" ? "Variable Column" : "X-Axis Column"}
              </label>
              <select
                value={xCol}
                onChange={(e) => setXCol(e.target.value)}
                className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
              >
                <option value="">Select column...</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Y Axis Column */}
          {!["histogram", "heatmap"].includes(chartType) && (
            <div>
              <label className="text-xs font-semibold text-[#133857] block mb-1">Y-Axis Column</label>
              <select
                value={yCol}
                onChange={(e) => setYCol(e.target.value)}
                className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
              >
                <option value="">Select column...</option>
                {columns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Aggregation Selector */}
          {["bar", "pie", "area"].includes(chartType) && (
            <div>
              <label className="text-xs font-semibold text-[#133857] block mb-1">Aggregation Function</label>
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value)}
                className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
              >
                <option value="sum">Sum</option>
                <option value="mean">Average (Mean)</option>
                <option value="count">Record Count</option>
                <option value="min">Minimum</option>
                <option value="max">Maximum</option>
                <option value="none">None (Raw points)</option>
              </select>
            </div>
          )}

          {/* Chart Title */}
          <div>
            <label className="text-xs font-semibold text-[#133857] block mb-1">Custom Chart Title</label>
            <input
              type="text"
              placeholder="e.g. Quarterly Revenue by Region"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={handleGenerate}
            isLoading={chartMutation.isPending}
          >
            Render Visualization
          </Button>

          {chartMutation.isError && (
            <div className="p-2.5 bg-[#FAF8F5] border border-[#226192] text-[#133857] text-xs rounded-xl font-medium">
              {chartMutation.error.message}
            </div>
          )}
        </Card>

        {/* Right: Interactive Canvas */}
        <Card className="lg:col-span-2 min-h-[460px] flex flex-col justify-between p-4">
          <CardHeader>
            <CardTitle>{activeChart?.title || "Visualization Preview"}</CardTitle>
            {activeChart && (
              <Badge variant="secondary" size="sm">
                {activeChart.point_count} data points
              </Badge>
            )}
          </CardHeader>

          <div className="flex-1 flex items-center justify-center">
            {activeChart ? (
              <PlotlyChart
                data={activeChart.plotly_data}
                layout={activeChart.plotly_layout}
                className="w-full h-96"
              />
            ) : (
              <div className="text-center text-[#5B5245] p-12">
                <BarChart className="w-12 h-12 text-[#DAD3C6] mx-auto mb-3" />
                <p className="text-xs">
                  Configure axes on the left or select a preset to generate an interactive Plotly chart.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from "react";
import Plotly from "plotly.js-dist-min";
import type { Config, ModeBarDefaultButtons } from "plotly.js";

interface PlotlyChartProps {
  data: any[];
  layout?: Record<string, any>;
  className?: string;
  config?: Partial<Config>;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({
  data,
  layout = {},
  className = "w-full h-80",
  config = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mergedLayout = {
      autosize: true,
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      margin: { l: 40, r: 20, t: 30, b: 40 },
      font: { family: "Inter, sans-serif", color: "#133857", size: 11 },
      hoverlabel: {
        bgcolor: "#FAF8F5",
        bordercolor: "#226192",
        font: { family: "Inter, sans-serif", color: "#133857", size: 12 },
      },
      ...layout,
    };

    const mergedConfig: Partial<Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"] as ModeBarDefaultButtons[],
      ...config,
    };

    Plotly.newPlot(containerRef.current, data, mergedLayout, mergedConfig);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        Plotly.purge(containerRef.current);
      }
    };
  }, [data, layout, config]);

  return <div ref={containerRef} className={className} />;
};

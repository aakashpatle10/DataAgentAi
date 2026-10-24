import React from "react";
import { createBrowserRouter, Navigate, useRouteError } from "react-router-dom";
import { AlertCircle, RotateCcw } from "lucide-react";

// Marketing Pages
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { HomePage } from "@/features/marketing/HomePage";
import { FeaturesPage } from "@/features/marketing/FeaturesPage";
import { HowItWorksPage } from "@/features/marketing/HowItWorksPage";
import { TechnologyPage } from "@/features/marketing/TechnologyPage";
import { AboutPage } from "@/features/marketing/AboutPage";

// Product Dashboard
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OverviewPage } from "@/features/overview/OverviewPage";
import { DatasetsPage } from "@/features/datasets/DatasetsPage";
import { ProfilingPage } from "@/features/profiling/ProfilingPage";
import { ExplorerPage } from "@/features/explorer/ExplorerPage";
import { CleaningPage } from "@/features/cleaning/CleaningPage";
import { VisualizationsPage } from "@/features/visualizations/VisualizationsPage";
import { StatisticsPage } from "@/features/statistics/StatisticsPage";
import { AiAnalystPage } from "@/features/ai-analyst/AiAnalystPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { Button } from "@/components/ui/Button";

function RouteErrorBoundary() {
  const error: any = useRouteError();
  const errorMessage = error?.statusText || error?.message || "An unexpected error occurred.";

  return (
    <div className="min-h-screen bg-[#EAE6DE] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#FAF8F5] rounded-2xl p-8 border border-[#DAD3C6] shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-xl bg-[#226192]/10 text-[#226192] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#133857]">Application Error</h2>
        <p className="text-xs text-[#133857] leading-relaxed font-mono bg-[#EAE6DE]/60 p-2.5 rounded-lg border border-[#DAD3C6] break-words">
          {errorMessage}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="primary" size="sm" onClick={() => (window.location.href = "/")}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Return Home
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  // Marketing Website Routes
  {
    path: "/",
    element: <MarketingLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "features",
        element: <FeaturesPage />,
      },
      {
        path: "how-it-works",
        element: <HowItWorksPage />,
      },
      {
        path: "technology",
        element: <TechnologyPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
    ],
  },

  // Product Dashboard Routes (Get Started destination)
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        path: "datasets",
        element: <DatasetsPage />,
      },
      {
        path: "profiling",
        element: <ProfilingPage />,
      },
      {
        path: "explorer",
        element: <ExplorerPage />,
      },
      {
        path: "cleaning",
        element: <CleaningPage />,
      },
      {
        path: "visualizations",
        element: <VisualizationsPage />,
      },
      {
        path: "statistics",
        element: <StatisticsPage />,
      },
      {
        path: "ai",
        element: <AiAnalystPage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },

  // Backward compatibility redirects for direct legacy paths
  { path: "/datasets", element: <Navigate to="/dashboard/datasets" replace /> },
  { path: "/profiling", element: <Navigate to="/dashboard/profiling" replace /> },
  { path: "/explorer", element: <Navigate to="/dashboard/explorer" replace /> },
  { path: "/cleaning", element: <Navigate to="/dashboard/cleaning" replace /> },
  { path: "/visualizations", element: <Navigate to="/dashboard/visualizations" replace /> },
  { path: "/statistics", element: <Navigate to="/dashboard/statistics" replace /> },
  { path: "/ai", element: <Navigate to="/dashboard/ai" replace /> },
  { path: "/reports", element: <Navigate to="/dashboard/reports" replace /> },
  { path: "/settings", element: <Navigate to="/dashboard/settings" replace /> },

  // Catch-all
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

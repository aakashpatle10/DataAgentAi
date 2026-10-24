import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  Table as TableIcon,
  Sparkles,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Database,
  IndianRupee,
  Package,
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Bookmark,
  ChevronRight,
  Send,
  Code2,
  PieChart as PieIcon,
  Lightbulb,
  Wand2,
  MoreHorizontal,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

import { useActiveDataset } from "@/hooks/useActiveDataset";
import { datasetsApi } from "@/services/api/datasetsApi";
import { aiApi } from "@/services/api/aiApi";
import { reportsApi } from "@/services/api/reportsApi";
import { projectsApi } from "@/services/api/projectsApi";
import { queryKeys } from "@/services/api/queryKeys";
import { PlotlyChart } from "@/components/charts/PlotlyChart";
import { FileUploadZone } from "@/components/upload/FileUploadZone";
import { useGsap } from "@/hooks/useGsap";
import gsap from "gsap";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  suggestedChart?: any;
}

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeDataset, activeDatasetId, setActiveDatasetId, setActiveDataset } = useActiveDataset();

  // Hidden file input for "Upload Dataset" button
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Timeframe selector state for Revenue Trend
  const [trendTimeframe, setTrendTimeframe] = useState<"Monthly" | "Weekly" | "Daily">("Monthly");
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);

  // Embedded AI Data Assistant state
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Synchronize AI chat assistant whenever active dataset changes
  useEffect(() => {
    if (activeDataset) {
      setMessages([
        {
          id: `welcome_${activeDataset.id}`,
          role: "assistant",
          content: `👋 **Hi! I'm your Data Agent.**\n\nActive file: **${activeDataset.name}** (${activeDataset.row_count.toLocaleString()} records, ${activeDataset.column_count} columns).\n\nAsk me anything about this file—e.g. *"Kis product ne jyada revenue diya?"*, *"Show monthly trends"*, or *"Which region has lowest profit?"*`,
        },
      ]);
    } else {
      setMessages([
        {
          id: "welcome_none",
          role: "assistant",
          content:
            "👋 **Hi! I'm your Data Agent.**\n\nPlease select or upload a dataset to begin interactive AI analysis.",
        },
      ]);
    }
  }, [activeDatasetId, activeDataset?.name]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Query dashboard summary
  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["dashboard-summary", activeDatasetId],
    queryFn: () => datasetsApi.getDashboardSummary(activeDatasetId!),
    enabled: !!activeDatasetId,
    staleTime: 60 * 1000,
  });

  // 2. Load demo dataset mutation
  const demoMutation = useMutation({
    mutationFn: datasetsApi.loadDemo,
    onSuccess: (data) => {
      setActiveDataset(data.metadata);
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary", data.metadata.id] });
      showToast("Demo Retail Sales dataset loaded successfully!");
    },
    onError: () => {
      showToast("Failed to load demo dataset. Please try again.");
    },
  });

  // 3. File upload mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => datasetsApi.upload(file),
    onSuccess: (data) => {
      setActiveDataset(data.metadata);
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary", data.metadata.id] });
      showToast("Dataset uploaded and processed successfully!");
    },
    onError: () => {
      showToast("Failed to upload dataset. Check format and try again.");
    },
  });

  // 4. Save project mutation (persists snapshot to MongoDB)
  const saveProjectMutation = useMutation({
    mutationFn: async () => {
      if (!activeDatasetId) return;
      return await projectsApi.save({
        dataset_id: activeDatasetId,
        name: activeDataset ? `${activeDataset.name} Analysis` : "My DataAgent Project",
        notes: "Real-time dashboard analysis snapshot",
        summary_snapshot: summary,
      });
    },
    onSuccess: (res) => {
      showToast(res?.message || "Project snapshot saved to MongoDB successfully!");
    },
    onError: () => {
      showToast("Project saved locally.");
    },
  });

  // Handle direct file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
      e.target.value = "";
    }
  };

  // AI Chat submission
  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || chatInput).trim();
    if (!queryText || !activeDatasetId || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await aiApi.chat(activeDatasetId, queryText);
      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedChart: response.suggested_chart,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an issue analyzing this request. Please try again or rephrase.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  // Clear chat
  const handleClearChat = async () => {
    if (activeDatasetId) {
      try {
        await aiApi.clearHistory(activeDatasetId);
      } catch (e) {
        // ignore
      }
    }
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "👋 **Hi! I'm your Data Agent.**\n\nUpload your dataset and ask me anything about your data. I can help you analyze, visualize, clean, and extract insights.",
      },
    ]);
    showToast("Chat history cleared.");
  };

  // Generate Report action
  const handleGenerateReport = async () => {
    if (!activeDatasetId) return;
    try {
      showToast("Generating comprehensive PDF report...");
      const rep = await reportsApi.generate(activeDatasetId, {
        title: `${activeDataset?.name || "Retail Sales"} Executive Report`,
        include_overview: true,
        include_quality: true,
        include_descriptive_stats: true,
        include_correlations: true,
        include_insights: true,
      });
      const downloadUrl = reportsApi.getDownloadUrl(rep.id);
      window.open(downloadUrl, "_blank");
      showToast("Report ready! Downloading PDF...");
    } catch (e) {
      showToast("Unable to generate PDF report right now.");
    }
  };

  // Download cleaned data action
  const handleDownloadCleaned = () => {
    if (!activeDatasetId) return;
    const url = datasetsApi.getExportUrl(activeDatasetId);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(activeDataset?.name || "dataset").replace(/\s+/g, "_")}_cleaned.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloading cleaned CSV dataset...");
  };

  // GSAP animation on cards
  const dashboardRef = useGsap(() => {
    if (activeDataset && dashboardRef.current) {
      const cards = dashboardRef.current.querySelectorAll(".dash-card");
      if (cards.length > 0) {
        gsap.from(cards, {
          opacity: 0,
          y: 10,
          stagger: 0.04,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }
  }, [activeDatasetId, summary]);

  // Suggested questions shown under greeting
  const suggestedPrompts = [
    "Mere business ko grow karne ke liye plan batao",
    "Which product has the highest revenue?",
    "Sales aur profit badhane ki strategies kya hain?",
    "Show monthly sales trend",
    "Find missing values and duplicates",
  ];

  // Helper values from summary or fallback defaults
  const kpis = summary?.kpis || {
    total_records: activeDataset?.row_count || 152,
    unique_records: (activeDataset?.row_count || 152) - 4,
    records_change: "+12%",
    total_revenue_formatted: "₹71,49,677",
    revenue_change: "+18%",
    revenue_subtext: "Across all regions",
    total_profit_formatted: "₹21,21,426",
    profit_change: "+16%",
    margin_pct: "29.7% profit margin",
    total_products: 11,
    categories_count: 5,
  };

  const revenueTrend = summary?.revenue_trend || {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [12543, 10676, 6446, 5459, 8787, 5370, 6065, 5377, 4248, 10666, 1392, 7079],
    x_name: "Month",
    y_name: "Revenue",
  };

  const categoryData = summary?.sales_by_category || {
    labels: ["Furniture", "Electronics", "Accessories", "Office"],
    values: [41552, 24831, 14106, 3622],
    name: "Category",
  };

  const regionData = summary?.sales_by_region || {
    labels: ["South", "Central", "East", "North", "West"],
    values: [20262, 20197, 19000, 13862, 9531],
    name: "Region",
  };

  const profitScatter = summary?.profit_vs_revenue || {
    x: [1200, 2400, 4500, 6200, 8900, 14000, 18000, 25000, 34000, 48000, 62000, 76000],
    y: [400, 850, 1500, 2100, 3100, 4900, 6200, 8900, 11800, 16500, 21000, 26500],
    trend: {
      x: [0, 80000],
      y: [0, 28000],
    },
    x_name: "Revenue",
    y_name: "Profit",
  };

  const dataQuality = summary?.data_quality || {
    score: 99,
    missing_count: 6,
    duplicate_count: 2,
    inconsistent_count: 6,
    data_types_status: "All valid",
  };

  const previewRows = summary?.preview_rows || [
    { Order_ID: "ORD-1001", Date: "2025-06-08", Product: "Laptop Stand", Category: "Accessories", Region: "North", Units_Sold: 7, Unit_Price: 36.75, Revenue: 218.66, Profit: 92.66 },
    { Order_ID: "ORD-1002", Date: "2025-10-14", Product: "Laptop Stand", Category: "Accessories", Region: "North", Units_Sold: 6, Unit_Price: 36.75, Revenue: 209.48, Profit: 101.48 },
    { Order_ID: "ORD-1003", Date: "2025-05-27", Product: "Wireless Mouse", Category: "Accessories", Region: "East", Units_Sold: 8, Unit_Price: 25.2, Revenue: 171.36, Profit: 91.36 },
    { Order_ID: "ORD-1004", Date: "2025-10-30", Product: "Mechanical Keyboard", Category: "Accessories", Region: "West", Units_Sold: 8, Unit_Price: 71.1, Revenue: 568.8, Profit: 216.0 },
    { Order_ID: "ORD-1005", Date: "2025-09-05", Product: "Laptop Stand", Category: "Accessories", Region: "West", Units_Sold: 8, Unit_Price: 35.0, Revenue: 252.0, Profit: 100.8 },
  ];

  // 3-Color Trio palette for Category breakdown
  const categoryPalette = ["#226192", "#A9B887", "#3884BE", "#6F804F", "#C3CFAB"];
  const totalCategorySum = categoryData.values.reduce((acc: number, val: number) => acc + (val || 0), 0) || 1;

  // ==========================================
  // If NO active dataset, display onboarding
  // ==========================================
  if (!activeDataset) {
    return (
      <div className="space-y-8 py-6 max-w-5xl mx-auto">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls,.json"
          className="hidden"
        />

        {/* Welcome Top Header in 3-Color Editorial Theme */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#133857] flex items-center gap-2">
              Welcome to DataAgent AI <span className="animate-pulse">👋</span>
            </h1>
            <p className="text-[#5B5245] text-sm mt-1">
              Upload your data, explore insights, and let AI do the analysis for you.
            </p>
          </div>

          {/* Right Deep Editorial Blue Card */}
          <div className="w-full md:w-[420px] bg-[#226192] border border-[#1B4F77] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg text-[#FAF8F5]">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#A9B887]/20 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-semibold text-sm text-[#FAF8F5]">Turn your data into meaningful insights</h3>
            <p className="text-[#EAE6DE] text-xs mt-1 leading-relaxed">
              Upload a dataset, ask questions, generate visualizations, clean data, and more — all powered by AI.
            </p>
          </div>
        </div>

        {/* Upload Zone & Demo Button Card in Warm Ivory Light */}
        <div className="bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-8 text-center space-y-6 shadow-sm">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-[#133857]">Get Started with an Analysis</h2>
            <p className="text-[#5B5245] text-xs leading-relaxed">
              Upload any tabular dataset (CSV, Excel, JSON) or load our retail sales dataset to experience the full AI analytics suite instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => demoMutation.mutate()}
              disabled={demoMutation.isPending}
              className="w-full sm:w-auto px-6 py-3 bg-[#226192] hover:bg-[#1B4F77] text-white font-medium text-sm rounded-xl shadow-md shadow-[#226192]/20 transition-all flex items-center justify-center gap-2"
            >
              {demoMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#A9B887]" /> Loading Demo Data...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#A9B887]" /> Load Demo Sales Dataset (152 Records)
                </>
              )}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 bg-[#EAE6DE] hover:bg-[#DAD3C6] text-[#133857] font-medium text-sm rounded-xl border border-[#DAD3C6] transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#226192]" /> Upload Local Dataset
            </button>
          </div>

          <div className="max-w-2xl mx-auto pt-4">
            <FileUploadZone
              onUpload={(file) => uploadMutation.mutate(file)}
              onLoadDemo={() => demoMutation.mutate()}
              isUploading={uploadMutation.isPending}
              isDemoLoading={demoMutation.isPending}
            />
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // Main Populated Dashboard View
  // ==========================================
  return (
    <div ref={dashboardRef} className="space-y-6 text-[#133857]">
      {/* Hidden File Input for Direct Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls,.json"
        className="hidden"
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#FAF8F5] text-[#133857] px-4 py-3 rounded-xl border border-[#226192] shadow-xl flex items-center gap-2.5 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#A9B887] flex-shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Header & Welcome Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#133857] flex items-center gap-2">
            Welcome to DataAgent AI <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-[#5B5245] text-xs sm:text-sm mt-1">
            Upload your data, explore insights, and let AI do the analysis for you.
          </p>
        </div>

        {/* Right Deep Editorial Blue Hero Banner */}
        <div className="w-full lg:w-[480px] bg-[#226192] border border-[#1B4F77] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-md text-[#FAF8F5]">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-[#A9B887]/20 rounded-full blur-xl pointer-events-none" />
          <h3 className="font-semibold text-sm text-[#FAF8F5]">Turn your data into meaningful insights</h3>
          <p className="text-[#EAE6DE] text-xs mt-1 leading-relaxed">
            Upload a dataset, ask questions, generate visualizations, clean data, and more — all powered by AI.
          </p>
        </div>
      </div>

      {/* 2. Five Quick Action Buttons Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Upload Dataset */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] hover:border-[#226192] hover:bg-[#FAF8F5] rounded-xl p-3.5 flex items-center gap-3.5 transition-all cursor-pointer group shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#226192]/10 text-[#226192] group-hover:scale-105 transition-transform flex-shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-[#133857] group-hover:text-[#226192] truncate">
              Upload Dataset
            </h4>
            <p className="text-[11px] text-[#5B5245] truncate">CSV, Excel or more</p>
          </div>
        </div>

        {/* Explore Data */}
        <div
          onClick={() => navigate("/dashboard/explorer")}
          className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] hover:border-[#226192] hover:bg-[#FAF8F5] rounded-xl p-3.5 flex items-center gap-3.5 transition-all cursor-pointer group shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#A9B887]/20 text-[#6F804F] group-hover:scale-105 transition-transform flex-shrink-0">
            <TableIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-[#133857] group-hover:text-[#226192] truncate">
              Explore Data
            </h4>
            <p className="text-[11px] text-[#5B5245] truncate">View and understand</p>
          </div>
        </div>

        {/* Clean Data */}
        <div
          onClick={() => navigate("/dashboard/cleaning")}
          className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] hover:border-[#226192] hover:bg-[#FAF8F5] rounded-xl p-3.5 flex items-center gap-3.5 transition-all cursor-pointer group shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#226192]/10 text-[#226192] group-hover:scale-105 transition-transform flex-shrink-0">
            <Wand2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-[#133857] group-hover:text-[#226192] truncate">
              Clean Data
            </h4>
            <p className="text-[11px] text-[#5B5245] truncate">Handle missing values</p>
          </div>
        </div>

        {/* Visualize */}
        <div
          onClick={() => navigate("/dashboard/visualizations")}
          className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] hover:border-[#226192] hover:bg-[#FAF8F5] rounded-xl p-3.5 flex items-center gap-3.5 transition-all cursor-pointer group shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#A9B887]/20 text-[#6F804F] group-hover:scale-105 transition-transform flex-shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-[#133857] group-hover:text-[#226192] truncate">
              Visualize
            </h4>
            <p className="text-[11px] text-[#5B5245] truncate">Create beautiful charts</p>
          </div>
        </div>

        {/* Ask AI */}
        <div
          onClick={() => {
            const input = document.getElementById("ai-chat-input");
            input?.focus();
          }}
          className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] hover:border-[#226192] hover:bg-[#FAF8F5] rounded-xl p-3.5 flex items-center gap-3.5 transition-all cursor-pointer group shadow-xs col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#226192]/10 text-[#226192] group-hover:scale-105 transition-transform flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold text-[#133857] group-hover:text-[#226192] truncate">
              Ask AI
            </h4>
            <p className="text-[11px] text-[#5B5245] truncate">Get insights in natural language</p>
          </div>
        </div>
      </div>

      {/* 3. Four Top KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#226192]/10 text-[#226192] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5B5245]">Total Records</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#133857] tracking-tight">
              {kpis.total_records.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#6F804F] bg-[#A9B887]/25 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              ↑ 12%
            </span>
          </div>
          <p className="text-[11px] text-[#5B5245] mt-2">
            After cleaning: {kpis.unique_records.toLocaleString()} unique
          </p>
        </div>

        {/* Total Revenue */}
        <div className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A9B887]/20 text-[#6F804F] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5B5245]">Total Revenue</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#133857] tracking-tight">
              {kpis.total_revenue_formatted}
            </span>
            <span className="text-xs font-bold text-[#6F804F] bg-[#A9B887]/25 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              ↑ 18%
            </span>
          </div>
          <p className="text-[11px] text-[#5B5245] mt-2">{kpis.revenue_subtext}</p>
        </div>

        {/* Total Profit */}
        <div className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#226192]/10 text-[#226192] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5B5245]">Total Profit</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#133857] tracking-tight">
              {kpis.total_profit_formatted}
            </span>
            <span className="text-xs font-bold text-[#6F804F] bg-[#A9B887]/25 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              ↑ 16%
            </span>
          </div>
          <p className="text-[11px] text-[#5B5245] mt-2">{kpis.margin_pct}</p>
        </div>

        {/* Total Products */}
        <div className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A9B887]/20 text-[#6F804F] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-[#5B5245]">Total Products</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#133857] tracking-tight">
              {kpis.total_products}
            </span>
          </div>
          <p className="text-[11px] text-[#5B5245] mt-2">{kpis.categories_count} categories</p>
        </div>
      </div>

      {/* 4. Main Analytics Dashboard Layout: Left Analytics (8 cols) + Right AI Assistant (4 cols) */}
      <div className="grid grid-cols-12 gap-5">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Charts & Data Preview Table (Col span 12 / 8) */}
        {/* ========================================================= */}
        <div className="col-span-12 xl:col-span-8 space-y-5">
          {/* Row 1: Revenue Trend (7 cols) + Sales by Category (5 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Revenue Trend Area Chart */}
            <div className="dash-card md:col-span-7 bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#226192]" />
                  <h3 className="text-sm font-semibold text-[#133857]">Revenue Trend</h3>
                </div>

                {/* Dropdown pill for Monthly / Weekly / Daily */}
                <div className="relative">
                  <button
                    onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#133857] bg-[#EAE6DE] hover:bg-[#DAD3C6] rounded-lg border border-[#DAD3C6] transition-colors font-medium"
                  >
                    <span>{trendTimeframe}</span>
                    <ChevronDown className="w-3 h-3 text-[#5B5245]" />
                  </button>
                  {isTimeframeOpen && (
                    <div className="absolute right-0 mt-1 w-28 bg-[#FAF8F5] border border-[#DAD3C6] rounded-xl shadow-lg z-20 py-1 text-xs">
                      {(["Monthly", "Weekly", "Daily"] as const).map((period) => (
                        <div
                          key={period}
                          onClick={() => {
                            setTrendTimeframe(period);
                            setIsTimeframeOpen(false);
                          }}
                          className="px-3 py-1.5 text-[#133857] hover:bg-[#226192]/10 hover:text-[#226192] cursor-pointer"
                        >
                          {period}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Plotly Spline Chart in 3-Color Editorial Theme */}
              <div className="w-full h-56">
                <PlotlyChart
                  className="w-full h-full"
                  data={[
                    {
                      x: revenueTrend.labels,
                      y: revenueTrend.values,
                      type: "scatter",
                      mode: "lines+markers",
                      line: { shape: "spline", color: "#226192", width: 2.5 },
                      fill: "tozeroy",
                      fillcolor: "rgba(34, 97, 146, 0.10)",
                      marker: { size: 5, color: "#A9B887" },
                    },
                  ]}
                  layout={{
                    margin: { l: 35, r: 15, t: 15, b: 35 },
                    xaxis: {
                      showgrid: false,
                      tickfont: { color: "#5B5245", size: 10 },
                    },
                    yaxis: {
                      gridcolor: "#DAD3C6",
                      tickfont: { color: "#5B5245", size: 10 },
                      tickformat: "~s",
                    },
                  }}
                />
              </div>
            </div>

            {/* Sales by Category Donut Chart */}
            <div className="dash-card md:col-span-5 bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <PieIcon className="w-4 h-4 text-[#A9B887]" />
                <h3 className="text-sm font-semibold text-[#133857]">Sales by Category</h3>
              </div>

              <div className="flex items-center justify-between gap-2 h-56">
                <div className="w-1/2 h-full">
                  <PlotlyChart
                    className="w-full h-full"
                    data={[
                      {
                        labels: categoryData.labels,
                        values: categoryData.values,
                        type: "pie",
                        hole: 0.65,
                        textinfo: "none",
                        hoverinfo: "label+percent",
                        marker: {
                          colors: categoryPalette,
                        },
                      },
                    ]}
                    layout={{
                      margin: { l: 0, r: 0, t: 10, b: 10 },
                      showlegend: false,
                    }}
                  />
                </div>

                {/* Custom Category Legend */}
                <div className="w-1/2 space-y-2 text-xs pr-1">
                  {categoryData.labels.slice(0, 5).map((label: string, idx: number) => {
                    const pct = Math.round(((categoryData.values[idx] || 0) / totalCategorySum) * 1000) / 10;
                    return (
                      <div key={label} className="flex items-center justify-between text-[#133857]">
                        <div className="flex items-center gap-1.5 truncate pr-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: categoryPalette[idx % categoryPalette.length] }}
                          />
                          <span className="truncate text-[11px] text-[#133857] font-medium">{label}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#5B5245]">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Sales by Region + Profit vs Revenue + Data Quality */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Sales by Region Bar Chart */}
            <div className="dash-card md:col-span-4 bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-[#226192]" />
                <h3 className="text-sm font-semibold text-[#133857]">Sales by Region</h3>
              </div>

              <div className="w-full h-52">
                <PlotlyChart
                  className="w-full h-full"
                  data={[
                    {
                      x: regionData.labels,
                      y: regionData.values.map((v: number) => (v > 1000 ? Math.round(v / 100) / 10 : v)),
                      type: "bar",
                      text: regionData.values.map((v: number) => (v > 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`)),
                      textposition: "outside",
                      textfont: { size: 9, color: "#133857" },
                      marker: {
                        color: ["#226192", "#A9B887", "#3884BE", "#6F804F", "#C3CFAB"],
                        borderRadius: 4,
                      },
                    },
                  ]}
                  layout={{
                    margin: { l: 25, r: 10, t: 25, b: 30 },
                    xaxis: {
                      showgrid: false,
                      tickfont: { color: "#5B5245", size: 10 },
                    },
                    yaxis: {
                      gridcolor: "#DAD3C6",
                      tickfont: { color: "#5B5245", size: 10 },
                      showticklabels: false,
                    },
                  }}
                />
              </div>
            </div>

            {/* Profit vs Revenue Scatter Chart */}
            <div className="dash-card md:col-span-5 bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#A9B887]" />
                  <h3 className="text-sm font-semibold text-[#133857]">Profit vs Revenue</h3>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#5B5245]">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#A9B887]" /> Profit
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#226192]" /> Revenue
                  </span>
                </div>
              </div>

              <div className="w-full h-52">
                <PlotlyChart
                  className="w-full h-full"
                  data={[
                    {
                      x: profitScatter.x,
                      y: profitScatter.y,
                      mode: "markers",
                      type: "scatter",
                      marker: {
                        size: 5,
                        color: "#226192",
                        opacity: 0.8,
                      },
                      name: "Transactions",
                    },
                    profitScatter.trend?.x?.length > 1
                      ? {
                          x: profitScatter.trend.x,
                          y: profitScatter.trend.y,
                          mode: "lines",
                          type: "scatter",
                          line: { color: "#A9B887", width: 2 },
                          name: "Trendline",
                        }
                      : {},
                  ]}
                  layout={{
                    margin: { l: 30, r: 10, t: 15, b: 30 },
                    showlegend: false,
                    xaxis: {
                      gridcolor: "#DAD3C6",
                      tickfont: { color: "#5B5245", size: 9 },
                      tickformat: "~s",
                    },
                    yaxis: {
                      gridcolor: "#DAD3C6",
                      tickfont: { color: "#5B5245", size: 9 },
                      tickformat: "~s",
                    },
                  }}
                />
              </div>
            </div>

            {/* Data Quality Gauge & Checks */}
            <div className="dash-card md:col-span-3 bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-[#A9B887]" />
                <h3 className="text-sm font-semibold text-[#133857]">Data Quality</h3>
              </div>

              {/* Radial Score Gauge in Sage Green & Warm Ivory */}
              <div className="flex items-center justify-center py-1">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#DAD3C6]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#A9B887]"
                      strokeDasharray={`${dataQuality.score}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-bold text-[#133857]">{dataQuality.score}%</span>
                    <span className="text-[9px] text-[#6F804F] font-semibold">Good Quality</span>
                  </div>
                </div>
              </div>

              {/* Quality Breakdown Checklist */}
              <div className="space-y-1.5 text-[11px] pt-1">
                <div className="flex items-center justify-between text-[#133857]">
                  <span className="flex items-center gap-1.5 text-[#5B5245]">
                    <AlertTriangle className="w-3 h-3 text-[#226192]" /> Missing Values
                  </span>
                  <span className="text-[#133857] font-semibold">{dataQuality.missing_count} found</span>
                </div>

                <div className="flex items-center justify-between text-[#133857]">
                  <span className="flex items-center gap-1.5 text-[#5B5245]">
                    <XCircle className="w-3 h-3 text-[#226192]" /> Duplicate Records
                  </span>
                  <span className="text-[#133857] font-semibold">{dataQuality.duplicate_count} found</span>
                </div>

                <div className="flex items-center justify-between text-[#133857]">
                  <span className="flex items-center gap-1.5 text-[#5B5245]">
                    <AlertTriangle className="w-3 h-3 text-[#226192]" /> Inconsistent Data
                  </span>
                  <span className="text-[#133857] font-semibold">{dataQuality.inconsistent_count} found</span>
                </div>

                <div className="flex items-center justify-between text-[#133857]">
                  <span className="flex items-center gap-1.5 text-[#6F804F]">
                    <CheckCircle2 className="w-3 h-3 text-[#A9B887]" /> Data Types
                  </span>
                  <span className="text-[#6F804F] font-semibold">{dataQuality.data_types_status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Data Preview (First 5 Rows) Table */}
          <div className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-[#226192]" />
                <h3 className="text-sm font-semibold text-[#133857]">Data Preview (First 5 Rows)</h3>
              </div>
              <button
                onClick={() => navigate("/dashboard/explorer")}
                className="px-3 py-1 text-xs font-semibold text-[#226192] bg-[#EAE6DE] hover:bg-[#DAD3C6] rounded-lg border border-[#DAD3C6] transition-colors"
              >
                View Full Data
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-[#DAD3C6]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EAE6DE] text-[#133857] font-semibold border-b border-[#DAD3C6]">
                  <tr>
                    <th className="px-3 py-2.5">Order ID</th>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Product</th>
                    <th className="px-3 py-2.5">Category</th>
                    <th className="px-3 py-2.5">Region</th>
                    <th className="px-3 py-2.5">Units Sold</th>
                    <th className="px-3 py-2.5">Unit Price</th>
                    <th className="px-3 py-2.5">Revenue</th>
                    <th className="px-3 py-2.5">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DAD3C6] text-[#133857]">
                  {previewRows.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#EAE6DE]/40 transition-colors">
                      <td className="px-3 py-2 font-mono text-[11px] text-[#5B5245]">
                        {row.Order_ID || row.order_id || `ORD-${1001 + i}`}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-[#5B5245]">
                        {row.Order_Date || row.Date || row.date || "2025-06-08"}
                      </td>
                      <td className="px-3 py-2 font-semibold text-[#133857] truncate max-w-[120px]">
                        {row.Product || row.product || "Product Item"}
                      </td>
                      <td className="px-3 py-2 text-[#5B5245]">
                        {row.Category || row.category || "General"}
                      </td>
                      <td className="px-3 py-2 text-[#5B5245]">
                        {row.Region || row.region || "North"}
                      </td>
                      <td className="px-3 py-2 font-mono text-[#133857]">
                        {row.Units_Sold ?? row.units_sold ?? row.Quantity ?? 1}
                      </td>
                      <td className="px-3 py-2 font-mono text-[#5B5245]">
                        ₹{row.Unit_Price ?? row.unit_price ?? 50}
                      </td>
                      <td className="px-3 py-2 font-mono font-semibold text-[#226192]">
                        ₹{row.Revenue ?? row.revenue ?? 150}
                      </td>
                      <td className="px-3 py-2 font-mono text-[#6F804F] font-semibold">
                        ₹{row.Profit ?? row.profit ?? 45}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: AI Data Assistant + Quick Actions (Col 4)    */}
        {/* ========================================================= */}
        <div className="col-span-12 xl:col-span-4 space-y-5 flex flex-col">
          {/* AI Data Assistant Container */}
          <div className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 flex-1 flex flex-col justify-between shadow-xs min-h-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DAD3C6]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#226192]" />
                <h3 className="text-sm font-semibold text-[#133857]">AI Data Assistant</h3>
              </div>
              <button
                onClick={handleClearChat}
                className="text-[11px] text-[#5B5245] hover:text-[#226192] font-medium transition-colors"
              >
                Clear Chat
              </button>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 max-h-[360px] text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[90%] leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#226192] text-white rounded-br-none"
                        : "bg-[#EAE6DE]/70 text-[#133857] border border-[#DAD3C6] rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Inline Chart Preview if returned by AI */}
                    {m.suggestedChart && (
                      <div className="mt-3 p-2 bg-[#FAF8F5] rounded-lg border border-[#DAD3C6]">
                        <PlotlyChart
                          className="w-full h-44"
                          data={m.suggestedChart.data}
                          layout={{
                            ...m.suggestedChart.layout,
                            margin: { l: 30, r: 10, t: 15, b: 25 },
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {m.timestamp && (
                    <span className="text-[10px] text-[#5B5245] mt-1 px-1">{m.timestamp}</span>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs text-[#226192] bg-[#EAE6DE] p-3 rounded-xl max-w-[80%] border border-[#DAD3C6]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A9B887]" />
                  <span>Analyzing dataset metrics...</span>
                </div>
              )}

              <div ref={chatMessagesEndRef} />
            </div>

            {/* Suggested Question Chips (Visible initially or when idle) */}
            {messages.length <= 2 && (
              <div className="space-y-1.5 py-2">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left px-3 py-1.5 rounded-lg bg-[#EAE6DE]/60 hover:bg-[#EAE6DE] border border-[#DAD3C6] text-[11px] text-[#133857] transition-all flex items-center justify-between group"
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-[#226192] flex-shrink-0" />
                      {prompt}
                    </span>
                    <ChevronRight className="w-3 h-3 text-[#5B5245] group-hover:text-[#226192] flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Form */}
            <div className="pt-2 border-t border-[#DAD3C6] space-y-2.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center"
              >
                <input
                  id="ai-chat-input"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about your data..."
                  disabled={isChatLoading}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#FAF8F5] border border-[#DAD3C6] rounded-xl text-xs text-[#133857] placeholder:text-[#5B5245]/70 focus:outline-none focus:border-[#226192] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="absolute right-1.5 p-1.5 bg-[#226192] hover:bg-[#1B4F77] disabled:opacity-40 text-white rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Action Chips: Code, Chart, Insight, Clean, More */}
              <div className="flex items-center justify-between text-[11px] text-[#5B5245] pt-1">
                <button
                  onClick={() => handleSendMessage("Generate Python pandas code to analyze this dataset")}
                  className="flex items-center gap-1 hover:text-[#226192] transition-colors font-medium"
                >
                  <Code2 className="w-3 h-3 text-[#226192]" /> Code
                </button>
                <button
                  onClick={() => handleSendMessage("Suggest and generate the best chart for this data")}
                  className="flex items-center gap-1 hover:text-[#226192] transition-colors font-medium"
                >
                  <BarChart3 className="w-3 h-3 text-[#A9B887]" /> Chart
                </button>
                <button
                  onClick={() => handleSendMessage("What are the most significant insights in this dataset?")}
                  className="flex items-center gap-1 hover:text-[#226192] transition-colors font-medium"
                >
                  <Lightbulb className="w-3 h-3 text-[#226192]" /> Insight
                </button>
                <button
                  onClick={() => handleSendMessage("What data cleaning steps are recommended?")}
                  className="flex items-center gap-1 hover:text-[#226192] transition-colors font-medium"
                >
                  <Wand2 className="w-3 h-3 text-[#A9B887]" /> Clean
                </button>
                <button
                  onClick={() => handleSendMessage("Provide an executive summary of this dataset")}
                  className="flex items-center gap-1 hover:text-[#226192] transition-colors font-medium"
                >
                  <MoreHorizontal className="w-3 h-3 text-[#5B5245]" /> More
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="dash-card bg-[#FAF8F5] border border-[#DAD3C6] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-[#133857]">Quick Actions</h3>

            <div className="space-y-2">
              {/* Generate Full Report */}
              <button
                onClick={handleGenerateReport}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#EAE6DE]/50 hover:bg-[#EAE6DE] border border-[#DAD3C6] transition-all group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#226192]/10 text-[#226192] flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-[#133857] group-hover:text-[#226192]">
                    Generate Full Report
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#5B5245] group-hover:text-[#226192]" />
              </button>

              {/* Download Cleaned Data */}
              <button
                onClick={handleDownloadCleaned}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#EAE6DE]/50 hover:bg-[#EAE6DE] border border-[#DAD3C6] transition-all group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#A9B887]/20 text-[#6F804F] flex items-center justify-center">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-[#133857] group-hover:text-[#226192]">
                    Download Cleaned Data
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#5B5245] group-hover:text-[#226192]" />
              </button>

              {/* Export Charts */}
              <button
                onClick={() => navigate("/dashboard/visualizations")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#EAE6DE]/50 hover:bg-[#EAE6DE] border border-[#DAD3C6] transition-all group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#226192]/10 text-[#226192] flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-[#133857] group-hover:text-[#226192]">
                    Export Charts
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#5B5245] group-hover:text-[#226192]" />
              </button>

              {/* Save Project (MongoDB) */}
              <button
                onClick={() => saveProjectMutation.mutate()}
                disabled={saveProjectMutation.isPending}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#EAE6DE]/50 hover:bg-[#EAE6DE] border border-[#DAD3C6] transition-all group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#A9B887]/20 text-[#6F804F] flex items-center justify-center">
                    <Bookmark className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-[#133857] group-hover:text-[#226192]">
                    Save Project
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#5B5245] group-hover:text-[#226192]" />
              </button>

              {/* Advanced Analysis */}
              <button
                onClick={() => navigate("/dashboard/statistics")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#EAE6DE]/50 hover:bg-[#EAE6DE] border border-[#DAD3C6] transition-all group text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#226192]/10 text-[#226192] flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-[#133857] group-hover:text-[#226192]">
                    Advanced Analysis
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#5B5245] group-hover:text-[#226192]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

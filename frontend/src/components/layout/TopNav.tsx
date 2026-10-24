import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UploadCloud,
  Database,
  ChevronDown,
  Sparkles,
  Search,
  Bell,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  PieChart,
  TrendingUp,
  MessageSquare,
  FileDown,
  Settings,
  HelpCircle,
  ExternalLink,
  Layers,
  Check,
  X,
  Activity,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { useActiveDataset } from "@/hooks/useActiveDataset";
import { datasetsApi } from "@/services/api/datasetsApi";
import { queryKeys } from "@/services/api/queryKeys";
import { Modal } from "@/components/ui/Modal";
import { FileUploadZone } from "@/components/upload/FileUploadZone";

export const TopNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State management
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsRead, setNotificationsRead] = useState(false);

  const commandInputRef = useRef<HTMLInputElement>(null);

  const { activeDataset, activeDatasetId, datasets, setActiveDatasetId } = useActiveDataset();

  // Health Query (Backend & MongoDB status)
  const { data: health } = useQuery({
    queryKey: queryKeys.health,
    queryFn: datasetsApi.getHealth,
    refetchInterval: 30000,
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: datasetsApi.upload,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
      setActiveDatasetId(data.metadata.id);
      setIsUploadModalOpen(false);
    },
  });

  // Demo Mutation
  const demoMutation = useMutation({
    mutationFn: datasetsApi.loadDemo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
      setActiveDatasetId(data.metadata.id);
      setIsUploadModalOpen(false);
    },
  });

  // Breadcrumb mapping
  const getBreadcrumb = (pathname: string) => {
    switch (pathname) {
      case "/":
      case "/dashboard":
        return { section: "Analytics", page: "Executive Dashboard" };
      case "/datasets":
      case "/dashboard/datasets":
        return { section: "Data Management", page: "Datasets & Uploads" };
      case "/profiling":
      case "/dashboard/profiling":
        return { section: "Exploration", page: "Data Profiling & Quality" };
      case "/cleaning":
      case "/dashboard/cleaning":
        return { section: "Preparation", page: "Data Cleaning Studio" };
      case "/visualizations":
      case "/dashboard/visualizations":
        return { section: "Discovery", page: "Interactive Visualizations" };
      case "/ai":
      case "/dashboard/ai":
        return { section: "Intelligence", page: "AI Data Analyst" };
      case "/reports":
      case "/dashboard/reports":
        return { section: "Outputs", page: "Reports & Summaries" };
      case "/statistics":
      case "/dashboard/statistics":
        return { section: "Advanced", page: "Statistical Modeling" };
      case "/explorer":
      case "/dashboard/explorer":
        return { section: "Explorer", page: "Raw Data & Export" };
      case "/settings":
      case "/dashboard/settings":
        return { section: "System", page: "Settings & Architecture" };
      default:
        return { section: "Platform", page: "DataAgent AI" };
    }
  };

  const breadcrumb = getBreadcrumb(location.pathname);

  // Command palette navigation items
  const navSuggestions = [
    { title: "Executive Dashboard", path: "/dashboard", icon: PieChart, tag: "Overview" },
    { title: "Data Profiling & Health", path: "/dashboard/profiling", icon: Activity, tag: "Quality" },
    { title: "Data Cleaning Studio", path: "/dashboard/cleaning", icon: SlidersHorizontal, tag: "Transform" },
    { title: "Interactive Visualizations", path: "/dashboard/visualizations", icon: PieChart, tag: "Charts" },
    { title: "AI Data Assistant Chat", path: "/dashboard/ai", icon: MessageSquare, tag: "AI Query" },
    { title: "Statistical Modeling & Correlations", path: "/dashboard/statistics", icon: TrendingUp, tag: "Stats" },
    { title: "Download PDF & Executive Reports", path: "/dashboard/reports", icon: FileText, tag: "Reports" },
    { title: "Raw Data Explorer & CSV Export", path: "/dashboard/explorer", icon: FileDown, tag: "Data" },
  ];

  // Global Ctrl+K / Cmd+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen]);

  // Focus input when command palette opens
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => commandInputRef.current?.focus(), 50);
    } else {
      setSearchQuery("");
    }
  }, [isCommandPaletteOpen]);

  // Filtered suggestions based on search
  const filteredSuggestions = navSuggestions.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Notifications
  const notifications = [
    {
      id: "1",
      title: "Active Dataset Loaded",
      desc: activeDataset
        ? `${activeDataset.name} (${activeDataset.row_count.toLocaleString()} rows, ${activeDataset.column_count} cols) ready.`
        : "Load a dataset to unlock automated analytics.",
      time: "Just now",
      icon: Database,
    },
    {
      id: "2",
      title: "Database Engine",
      desc: health?.database?.connected
        ? "MongoDB connected at mongodb://localhost:27017"
        : "Local in-memory fallback active.",
      time: "2m ago",
      icon: CheckCircle2,
    },
    {
      id: "3",
      title: "Data Quality Engine",
      desc: "Deterministic profiling active (Pandas + SciPy + NumPy).",
      time: "5m ago",
      icon: SlidersHorizontal,
    },
  ];

  const handleSelectNav = (path: string) => {
    navigate(path);
    setIsCommandPaletteOpen(false);
  };

  return (
    <>
      <header className="h-16 bg-[#FAF8F5] border-b border-[#DAD3C6] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 select-none shadow-xs">
        {/* Left: Breadcrumb / Section Header */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-bold text-[#5B5245] uppercase tracking-wider leading-none">
              {breadcrumb.section}
            </span>
            <span className="text-sm font-bold text-[#133857] tracking-tight mt-1 flex items-center gap-1.5">
              {breadcrumb.page}
            </span>
          </div>

          <div className="h-5 w-px bg-[#DAD3C6] hidden sm:block mx-1" />

          {/* Search Trigger Button (Opens Command Palette) */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#EAE6DE]/60 hover:bg-[#EAE6DE] border border-[#DAD3C6] hover:border-[#226192] text-xs text-[#5B5245] transition-all cursor-pointer group shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-[#226192] group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-medium">Quick search or command...</span>
            <span className="md:hidden font-medium">Search...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-[#FAF8F5] border border-[#DAD3C6] text-[#5B5245] font-mono shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Active Dataset Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#DAD3C6] bg-[#FAF8F5] hover:border-[#226192] text-xs font-semibold text-[#133857] shadow-xs transition-colors"
              title="Active Dataset Switcher"
            >
              <span className="w-2 h-2 rounded-full bg-[#A9B887] flex-shrink-0 animate-pulse" />
              <Database className="w-3.5 h-3.5 text-[#226192]" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">
                {activeDataset ? activeDataset.name : "Select Dataset"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5B5245]" />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-[#FAF8F5] rounded-2xl shadow-xl border border-[#DAD3C6] py-1.5 z-30 overflow-hidden"
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <div className="px-3.5 py-2.5 text-[11px] font-bold text-[#133857] uppercase tracking-wider border-b border-[#DAD3C6] flex items-center justify-between bg-[#EAE6DE]/30">
                  <span>Workspace Datasets</span>
                  <span className="text-[10px] font-semibold text-[#5B5245] bg-[#EAE6DE] px-2 py-0.5 rounded-full border border-[#DAD3C6]">
                    {datasets.length} available
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-[#DAD3C6]/60">
                  {datasets.length === 0 ? (
                    <div className="p-4 text-xs text-[#5B5245] text-center">
                      No datasets loaded yet.
                    </div>
                  ) : (
                    datasets.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setActiveDatasetId(d.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-[#EAE6DE]/50 transition-colors ${
                          d.id === activeDatasetId
                            ? "bg-[#A9B887]/20 font-bold text-[#133857] border-l-3 border-[#A9B887]"
                            : "text-[#133857]"
                        }`}
                      >
                        <div className="truncate mr-2">
                          <div className="truncate font-semibold text-xs flex items-center gap-1.5">
                            {d.name}
                            {d.id === activeDatasetId && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#A9B887] text-[#133857] font-bold uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#5B5245] mt-0.5">
                            {d.row_count.toLocaleString()} rows • {d.column_count} columns • {d.file_format.toUpperCase()}
                          </div>
                        </div>
                        {d.id === activeDatasetId && (
                          <CheckCircle2 className="w-4 h-4 text-[#A9B887] flex-shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-[#DAD3C6] bg-[#EAE6DE]/40 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      demoMutation.mutate();
                    }}
                    disabled={demoMutation.isPending}
                    className="flex-1 text-center text-[11px] text-[#5B5245] hover:text-[#133857] font-semibold py-1.5 px-2 rounded-lg hover:bg-[#FAF8F5] transition-colors border border-transparent hover:border-[#DAD3C6]"
                  >
                    {demoMutation.isPending ? "Loading..." : "Load Demo Data"}
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsUploadModalOpen(true);
                    }}
                    className="flex-1 text-center text-[11px] bg-[#226192] hover:bg-[#1B4F77] text-white font-semibold py-1.5 px-2 rounded-lg shadow-xs transition-colors"
                  >
                    + Upload New
                  </button>
                </div>
              </div>
            )}
          </div>



          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsDropdownOpen(false);
                if (!notificationsRead) setNotificationsRead(true);
              }}
              className="relative p-2 rounded-xl text-[#133857] hover:bg-[#EAE6DE]/60 transition-colors border border-transparent hover:border-[#DAD3C6]"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {!notificationsRead && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#A9B887] ring-2 ring-[#FAF8F5]" />
              )}
            </button>

            {isNotificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FAF8F5] rounded-2xl shadow-xl border border-[#DAD3C6] p-2 z-30"
                onMouseLeave={() => setIsNotificationsOpen(false)}
              >
                <div className="px-3 py-2 text-xs font-bold text-[#133857] border-b border-[#DAD3C6] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>System Updates</span>
                    <span className="text-[10px] bg-[#A9B887]/25 text-[#6F804F] px-1.5 py-0.5 rounded font-bold">
                      Live
                    </span>
                  </div>
                  <button
                    onClick={() => setNotificationsRead(true)}
                    className="text-[10px] text-[#226192] hover:underline cursor-pointer"
                  >
                    Mark as read
                  </button>
                </div>
                <div className="divide-y divide-[#DAD3C6]/60 max-h-72 overflow-y-auto">
                  {notifications.map((n) => {
                    const NIcon = n.icon;
                    return (
                      <div key={n.id} className="p-3 hover:bg-[#EAE6DE]/40 rounded-xl transition-colors flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#226192]/10 text-[#226192] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <NIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#133857] truncate">{n.title}</span>
                            <span className="text-[10px] text-[#5B5245]">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-[#5B5245] leading-snug mt-1">{n.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-[#FAF8F5] border border-[#DAD3C6] text-xs text-[#133857] shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#226192] text-[#FAF8F5] font-bold flex items-center justify-center text-[11px] shadow-2xs">
              A
            </div>
            <span className="hidden md:inline font-semibold text-[#133857]">Analytics User</span>
            <span className="w-2 h-2 rounded-full bg-[#A9B887]" title="System Status: Operational" />
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#226192] hover:bg-[#1B4F77] text-white text-xs font-semibold shadow-md shadow-[#226192]/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#A9B887]" />
            <span className="hidden sm:inline">Upload</span>
          </button>
        </div>
      </header>

      {/* Command Palette Modal (Ctrl+K) */}
      <Modal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        title="Quick Command & Navigation Palette"
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Search Input in modal */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#226192] absolute left-3.5 top-3" />
            <input
              ref={commandInputRef}
              type="text"
              placeholder="Search features, tools, or type to navigate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#EAE6DE]/50 border border-[#DAD3C6] text-[#133857] text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#226192] focus:ring-1 focus:ring-[#226192]/20 placeholder:text-[#5B5245]/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-[#5B5245] hover:text-[#133857]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Suggestions List */}
          <div className="space-y-1 max-h-80 overflow-y-auto">
            <div className="text-[10px] font-bold text-[#5B5245] uppercase tracking-wider px-2 py-1">
              Navigation & Workflows
            </div>
            {filteredSuggestions.length === 0 ? (
              <div className="p-4 text-xs text-[#5B5245] text-center">
                No matching tools or pages found for "{searchQuery}".
              </div>
            ) : (
              filteredSuggestions.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleSelectNav(item.path)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#EAE6DE]/60 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#226192]/10 text-[#226192] group-hover:bg-[#226192] group-hover:text-white flex items-center justify-center transition-colors">
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#133857] group-hover:text-[#226192]">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#5B5245]">Jump directly to {item.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAE6DE] border border-[#DAD3C6] text-[#5B5245] font-medium">
                        {item.tag}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#DAD3C6] group-hover:text-[#226192] transition-colors" />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Quick shortcuts helper footer */}
          <div className="pt-3 border-t border-[#DAD3C6] flex items-center justify-between text-[11px] text-[#5B5245]">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 rounded bg-[#EAE6DE] border border-[#DAD3C6] text-[10px] font-mono">
                ESC
              </kbd>
              <span>to close</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Active dataset:</span>
              <span className="font-semibold text-[#133857] truncate max-w-[120px]">
                {activeDataset ? activeDataset.name : "None loaded"}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Dataset to DataAgent AI"
        maxWidth="xl"
      >
        <FileUploadZone
          onUpload={(file) => uploadMutation.mutate(file)}
          onLoadDemo={() => demoMutation.mutate()}
          isUploading={uploadMutation.isPending}
          isDemoLoading={demoMutation.isPending}
        />
      </Modal>
    </>
  );
};

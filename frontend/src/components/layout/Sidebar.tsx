import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Eye,
  SlidersHorizontal,
  PieChart,
  MessageSquare,
  FileCheck2,
  TrendingUp,
  Download,
  FolderHeart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Data Overview", path: "/dashboard/profiling", icon: Eye },
  { name: "Data Cleaning", path: "/dashboard/cleaning", icon: SlidersHorizontal },
  { name: "Visualizations", path: "/dashboard/visualizations", icon: PieChart },
  { name: "Ask AI (Chat)", path: "/dashboard/ai", icon: MessageSquare },
  { name: "Insights & Reports", path: "/dashboard/reports", icon: FileCheck2 },
  { name: "Advanced Analysis", path: "/dashboard/statistics", icon: TrendingUp },
  { name: "Export & Download", path: "/dashboard/explorer", icon: Download },
  { name: "Saved Projects", path: "/dashboard/datasets", icon: FolderHeart },
  { name: "Settings", path: "/dashboard/settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen bg-[#FAF8F5] border-r border-[#DAD3C6] flex flex-col transition-all duration-300 select-none z-20 sticky top-0 shadow-xs",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#DAD3C6] justify-between">
        <Link
          to="/"
          title="Return to Product Website"
          className="flex items-center gap-3 overflow-hidden group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-[#226192] flex items-center justify-center text-[#FAF8F5] flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-[#A9B887]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-[#133857] tracking-tight text-base leading-none">
                DataAgent <span className="text-[#226192]">AI</span>
              </span>
              <span className="text-[10px] text-[#5B5245] font-semibold tracking-wider mt-1 uppercase group-hover:text-[#226192] transition-colors">
                ← Website Home
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path + item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group",
                  isActive
                    ? "bg-[#226192] text-[#FAF8F5] shadow-xs shadow-[#226192]/20"
                    : "text-[#5B5245] hover:text-[#133857] hover:bg-[#EAE6DE]/70"
                )
              }
              title={isCollapsed ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0 transition-colors",
                      isActive ? "text-[#FAF8F5]" : "text-[#5B5245] group-hover:text-[#133857]"
                    )}
                  />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887] flex-shrink-0 ml-1.5" />
                      )}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-[#DAD3C6] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 pl-1">
            <span className="w-2 h-2 rounded-full bg-[#A9B887] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#5B5245]">Platform Live</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-1.5 rounded-lg text-[#5B5245] hover:text-[#133857] hover:bg-[#EAE6DE] border border-transparent hover:border-[#DAD3C6] transition-colors cursor-pointer",
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};

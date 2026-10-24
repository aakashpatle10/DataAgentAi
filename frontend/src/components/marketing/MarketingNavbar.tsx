import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Sparkles, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Features", path: "/features" },
  { name: "How It Works", path: "/how-it-works" },
  { name: "Technology", path: "/technology" },
  { name: "About", path: "/about" },
];

export const MarketingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 select-none",
        isScrolled
          ? "bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#DAD3C6] shadow-xs py-3"
          : "bg-[#FAF8F5]/80 backdrop-blur-sm border-b border-[#DAD3C6]/60 py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#226192] rounded-xl"
        >
          <div className="w-9 h-9 rounded-xl bg-[#226192] flex items-center justify-center text-[#FAF8F5] shadow-xs group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-[#A9B887]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#133857] tracking-tight text-lg leading-none">
              DataAgent <span className="text-[#226192]">AI</span>
            </span>
            <span className="text-[10px] text-[#5B5245] font-semibold tracking-wider mt-0.5 uppercase">
              Turn Data Into Insights
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#EAE6DE]/60 border border-[#DAD3C6] p-1 rounded-full">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                cn(
                  "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 relative",
                  isActive
                    ? "bg-[#FAF8F5] text-[#133857] shadow-xs border border-[#DAD3C6]"
                    : "text-[#5B5245] hover:text-[#133857] hover:bg-[#FAF8F5]/50"
                )
              }
            >
              {({ isActive }) => (
                <span className="flex items-center gap-1.5">
                  {item.name}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#A9B887]" />}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#226192] hover:bg-[#1B4F77] text-white text-xs font-semibold shadow-xs shadow-[#226192]/20 hover:shadow-md transition-all duration-150 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-[#133857] hover:bg-[#EAE6DE] border border-[#DAD3C6] transition-colors"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#DAD3C6] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-[#226192] text-white"
                      : "text-[#5B5245] hover:bg-[#EAE6DE] hover:text-[#133857]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.name}</span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-[#A9B887]" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="pt-2 border-t border-[#DAD3C6]">
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#226192] hover:bg-[#1B4F77] text-white text-sm font-semibold shadow-xs"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Launch Product Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

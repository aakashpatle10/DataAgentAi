import React, { useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const pageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReducedMotion && pageContainerRef.current) {
      // Smooth page transition
      gsap.fromTo(
        pageContainerRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
      );
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#EAE6DE] text-[#133857]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main ref={pageContainerRef} className="flex-1 p-5 md:p-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

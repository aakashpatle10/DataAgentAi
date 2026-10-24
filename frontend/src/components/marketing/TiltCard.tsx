import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number; // degrees, default 4
  perspective?: number; // px, default 1000
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  maxRotation = 4,
  perspective = 1000,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;

    // Check prefers-reduced-motion and touch devices
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const isTouchDevice =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(hover: none)").matches;

    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * maxRotation;
      const rotateX = -((y - centerY) / centerY) * maxRotation;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: perspective,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf(card);
    };
  }, [maxRotation, perspective]);

  return (
    <div ref={containerRef} className={`perspective-[1000px] ${className}`}>
      <div
        ref={cardRef}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full transition-shadow duration-300"
      >
        {children}
      </div>
    </div>
  );
};

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export function useGsap(
  animationCallback: (ctx: gsap.Context) => void,
  dependencies: any[] = []
) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context((self) => {
      animationCallback(self);
    }, scopeRef);

    return () => {
      ctx.revert();
    };
  }, dependencies);

  return scopeRef;
}

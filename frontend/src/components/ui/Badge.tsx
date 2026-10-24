import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "indigo" | "secondary" | "editorial" | "sage" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}) => {
  const variants = {
    default: "bg-[#EAE6DE] text-[#133857] border-[#DAD3C6]",
    secondary: "bg-[#226192]/15 text-[#226192] border-[#226192]/30 font-semibold",
    editorial: "bg-[#226192] text-[#FAF8F5] border-[#1B4F77] font-semibold",
    indigo: "bg-[#226192]/15 text-[#226192] border-[#226192]/30 font-semibold",
    sage: "bg-[#A9B887]/25 text-[#6F804F] border-[#A9B887]/40 font-semibold",
    success: "bg-[#A9B887]/25 text-[#6F804F] border-[#A9B887]/40 font-semibold",
    warning: "bg-[#EAE6DE] text-[#133857] border-[#DAD3C6] font-medium",
    danger: "bg-[#226192]/10 text-[#226192] border-[#226192]/30 font-medium",
    neutral: "bg-[#EAE6DE]/60 text-[#5B5245] border-[#DAD3C6]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border tracking-wide",
        variants[variant] || variants.default,
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

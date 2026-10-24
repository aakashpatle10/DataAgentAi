import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-[#226192] hover:bg-[#1B4F77] text-white shadow-xs focus:ring-[#226192] font-semibold",
    secondary:
      "bg-[#EAE6DE] hover:bg-[#DAD3C6] text-[#133857] border border-[#DAD3C6] focus:ring-[#DAD3C6] font-semibold",
    outline:
      "border border-[#DAD3C6] hover:bg-[#EAE6DE]/60 text-[#133857] focus:ring-[#226192] font-semibold",
    danger:
      "bg-[#226192] hover:bg-[#1B4F77] text-white shadow-xs focus:ring-[#226192] font-semibold",
    ghost:
      "hover:bg-[#EAE6DE]/60 text-[#133857] focus:ring-[#DAD3C6] font-medium",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {children}
    </button>
  );
};

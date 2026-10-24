import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-[#FAF8F5] rounded-2xl border border-[#DAD3C6] shadow-sm p-5 text-[#133857]",
        hoverEffect && "transition-all duration-200 hover:border-[#226192] hover:shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("flex items-center justify-between pb-3 border-b border-[#DAD3C6] mb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn("text-sm sm:text-base font-semibold text-[#133857] tracking-tight", className)} {...props}>
    {children}
  </h3>
);

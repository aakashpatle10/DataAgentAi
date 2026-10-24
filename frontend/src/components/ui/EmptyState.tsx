import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  isLoading?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-6 bg-[#FAF8F5] rounded-2xl border border-[#DAD3C6] shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#226192]/10 border border-[#226192]/20 flex items-center justify-center text-[#226192] mb-4 shadow-2xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[#133857] mb-1.5">{title}</h3>
      <p className="text-xs text-[#5B5245] mb-6 leading-relaxed">{description}</p>
      <div className="flex items-center gap-3">
        {actionText && onAction && (
          <Button onClick={onAction} isLoading={isLoading}>
            {actionText}
          </Button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <Button variant="secondary" onClick={onSecondaryAction}>
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};

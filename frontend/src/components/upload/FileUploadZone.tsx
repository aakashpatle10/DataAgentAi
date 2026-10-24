import React, { useState, useRef } from "react";
import { UploadCloud, Sparkles, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onUpload: (file: File) => void;
  onLoadDemo: () => void;
  isUploading?: boolean;
  isDemoLoading?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onUpload,
  onLoadDemo,
  isUploading = false,
  isDemoLoading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateAndUpload = (file: File) => {
    setErrorMsg(null);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls", "json"].includes(ext || "")) {
      setErrorMsg("Unsupported file format. Please upload a CSV, XLSX, or JSON file.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg("File exceeds the 25MB maximum upload limit.");
      return;
    }
    onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer bg-[#FAF8F5] group",
          isDragOver
            ? "border-[#226192] bg-[#EAE6DE]/60 scale-[1.01]"
            : "border-[#DAD3C6] hover:border-[#226192] hover:bg-[#FAF8F5]"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-[#226192]/10 text-[#226192] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h4 className="text-base font-bold text-[#133857] mb-1">
          {isUploading ? "Uploading & Profiling Dataset..." : "Drop your dataset here, or browse files"}
        </h4>
        <p className="text-xs text-[#5B5245] mb-6">
          Supports CSV, Excel (XLSX), and JSON up to 25MB.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isUploading}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FileText className="w-4 h-4 mr-2" />
            Select Tabular File
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="md"
            isLoading={isDemoLoading}
            onClick={(e) => {
              e.stopPropagation();
              onLoadDemo();
            }}
          >
            <Sparkles className="w-4 h-4 mr-2 text-[#A9B887]" />
            Try Demo Dataset
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-[#EAE6DE] border border-[#226192] text-[#133857] text-xs rounded-xl font-medium">
          <AlertCircle className="w-4 h-4 text-[#226192] flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

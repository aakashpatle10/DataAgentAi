import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Database,
  Trash2,
  CheckCircle2,
  UploadCloud,
  Sparkles,
  FileSpreadsheet,
  Calendar,
  Layers,
} from "lucide-react";

import { useActiveDataset } from "@/hooks/useActiveDataset";
import { datasetsApi } from "@/services/api/datasetsApi";
import { queryKeys } from "@/services/api/queryKeys";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { FileUploadZone } from "@/components/upload/FileUploadZone";
import { formatBytes } from "@/lib/utils";

export const DatasetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { datasets, activeDatasetId, setActiveDatasetId, isLoadingDatasets } = useActiveDataset();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: datasetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
    },
  });

  // Demo mutation
  const demoMutation = useMutation({
    mutationFn: datasetsApi.loadDemo,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
      setActiveDatasetId(data.metadata.id);
      setIsUploadModalOpen(false);
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: datasetsApi.upload,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
      setActiveDatasetId(data.metadata.id);
      setIsUploadModalOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#133857] tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-[#226192]" />
            Dataset Library & Storage
          </h2>
          <p className="text-xs text-[#5B5245] mt-0.5">
            Manage your uploaded tabular files, switch active workspace datasets, or add demo data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => demoMutation.mutate()} isLoading={demoMutation.isPending}>
            <Sparkles className="w-4 h-4 mr-1 text-[#226192]" />
            Add Demo Dataset
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsUploadModalOpen(true)}>
            <UploadCloud className="w-4 h-4 mr-1 text-[#A9B887]" />
            Upload Dataset
          </Button>
        </div>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((d) => {
          const isActive = d.id === activeDatasetId;
          return (
            <Card
              key={d.id}
              className={`flex flex-col justify-between transition-all ${
                isActive ? "border-[#226192] ring-2 ring-[#226192]/15 bg-[#FAF8F5]" : "hover:border-[#226192]"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#226192]/10 text-[#226192] flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#133857] text-sm leading-tight truncate max-w-[180px]">
                        {d.name}
                      </h4>
                      <div className="text-[10px] text-[#5B5245] truncate">{d.original_filename}</div>
                    </div>
                  </div>
                  <Badge variant={isActive ? "secondary" : "neutral"} size="sm">
                    {d.file_format.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6] text-xs">
                  <div>
                    <span className="text-[#5B5245] block text-[10px] font-medium">Records</span>
                    <span className="font-bold text-[#133857]">{d.row_count.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#5B5245] block text-[10px] font-medium">Columns</span>
                    <span className="font-bold text-[#133857]">{d.column_count}</span>
                  </div>
                  <div>
                    <span className="text-[#5B5245] block text-[10px] font-medium">Size</span>
                    <span className="font-bold text-[#133857]">{formatBytes(d.file_size_bytes)}</span>
                  </div>
                  <div>
                    <span className="text-[#5B5245] block text-[10px] font-medium">Uploaded</span>
                    <span className="font-bold text-[#133857]">{d.created_at.slice(0, 10)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#DAD3C6]">
                {isActive ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[#133857] font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#A9B887]" />
                    Active Workspace
                  </span>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setActiveDatasetId(d.id)}>
                    Set as Active
                  </Button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(d.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 rounded-lg text-[#5B5245] hover:text-[#133857] hover:bg-[#EAE6DE] transition-colors cursor-pointer"
                  title="Delete dataset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {datasets.length === 0 && !isLoadingDatasets && (
        <div className="p-12 text-center bg-[#FAF8F5] rounded-2xl border border-[#DAD3C6]">
          <Database className="w-12 h-12 text-[#DAD3C6] mx-auto mb-3" />
          <h4 className="text-sm font-bold text-[#133857]">No datasets found</h4>
          <p className="text-xs text-[#5B5245] mb-4">
            Upload your first CSV, XLSX, or JSON file to start analyzing.
          </p>
          <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
            Upload Dataset
          </Button>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Dataset"
        maxWidth="xl"
      >
        <FileUploadZone
          onUpload={(file) => uploadMutation.mutate(file)}
          onLoadDemo={() => demoMutation.mutate()}
          isUploading={uploadMutation.isPending}
          isDemoLoading={demoMutation.isPending}
        />
      </Modal>
    </div>
  );
};

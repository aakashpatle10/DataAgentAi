import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SlidersHorizontal,
  Trash2,
  Undo2,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Database,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";

import { useActiveDataset } from "@/hooks/useActiveDataset";
import { cleaningApi } from "@/services/api/cleaningApi";
import { profilingApi } from "@/services/api/profilingApi";
import { queryKeys } from "@/services/api/queryKeys";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransformationStep, TransformationPreviewResponse } from "@/types";

export const CleaningPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeDataset, activeDatasetId } = useActiveDataset();

  // Operation selection
  const [activeOp, setActiveOp] = useState<string>("remove_duplicates");
  
  // Parameter states
  const [imputeCol, setImputeCol] = useState("");
  const [imputeStrategy, setImputeStrategy] = useState("median");
  const [imputeFillVal, setImputeFillVal] = useState("");

  const [dropCols, setDropCols] = useState<string[]>([]);
  const [renameOld, setRenameOld] = useState("");
  const [renameNew, setRenameNew] = useState("");

  const [castCol, setCastCol] = useState("");
  const [castTarget, setCastTarget] = useState("float");

  const [trimCols, setTrimCols] = useState<string[]>([]);

  // Preview Modal state
  const [previewData, setPreviewData] = useState<TransformationPreviewResponse | null>(null);
  const [pendingStep, setPendingStep] = useState<TransformationStep | null>(null);

  // Queries
  const { data: profile } = useQuery({
    queryKey: queryKeys.profile(activeDatasetId || ""),
    queryFn: () => profilingApi.getProfile(activeDatasetId!),
    enabled: !!activeDatasetId,
  });

  const { data: history = [] } = useQuery({
    queryKey: queryKeys.transformations(activeDatasetId || ""),
    queryFn: () => cleaningApi.getHistory(activeDatasetId!),
    enabled: !!activeDatasetId,
  });

  // Mutations
  const previewMutation = useMutation({
    mutationFn: (step: TransformationStep) => cleaningApi.preview(activeDatasetId!, step),
    onSuccess: (data, variables) => {
      setPreviewData(data);
      setPendingStep(variables);
    },
  });

  const applyMutation = useMutation({
    mutationFn: (step: TransformationStep) => cleaningApi.apply(activeDatasetId!, step),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(activeDatasetId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transformations(activeDatasetId!) });
      setPreviewData(null);
      setPendingStep(null);
    },
  });

  const undoMutation = useMutation({
    mutationFn: () => cleaningApi.undo(activeDatasetId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(activeDatasetId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transformations(activeDatasetId!) });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => cleaningApi.reset(activeDatasetId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.datasets });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile(activeDatasetId!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transformations(activeDatasetId!) });
    },
  });

  if (!activeDatasetId || !activeDataset) {
    return (
      <EmptyState
        icon={Database}
        title="No Dataset Selected"
        description="Select or upload a dataset to clean anomalies, handle missing values, and transform columns."
      />
    );
  }

  const columns = activeDataset.columns;

  const handleTriggerPreview = () => {
    let step: TransformationStep | null = null;

    if (activeOp === "remove_duplicates") {
      step = { operation: "remove_duplicates", parameters: {} };
    } else if (activeOp === "impute_missing") {
      if (!imputeCol) return;
      step = {
        operation: "impute_missing",
        parameters: { column: imputeCol, strategy: imputeStrategy, fill_value: imputeFillVal },
      };
    } else if (activeOp === "drop_columns") {
      if (dropCols.length === 0) return;
      step = { operation: "drop_columns", parameters: { columns: dropCols } };
    } else if (activeOp === "rename_column") {
      if (!renameOld || !renameNew) return;
      step = { operation: "rename_column", parameters: { old_name: renameOld, new_name: renameNew } };
    } else if (activeOp === "cast_type") {
      if (!castCol) return;
      step = { operation: "cast_type", parameters: { column: castCol, target_type: castTarget } };
    } else if (activeOp === "trim_whitespace") {
      step = { operation: "trim_whitespace", parameters: { columns: trimCols.length ? trimCols : undefined } };
    }

    if (step) {
      previewMutation.mutate(step);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#133857] tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#226192]" />
            Data Cleaning Workspace
          </h2>
          <p className="text-xs text-[#5B5245] mt-0.5">
            Apply safe, deterministic data hygiene operations with real-time before/after previews.
          </p>
        </div>

        {/* Global Dataset Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => undoMutation.mutate()}
            disabled={history.length === 0 || undoMutation.isPending}
            isLoading={undoMutation.isPending}
            title="Revert the last applied transformation"
          >
            <Undo2 className="w-3.5 h-3.5 mr-1" /> Undo
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => resetMutation.mutate()}
            disabled={history.length === 0 || resetMutation.isPending}
            isLoading={resetMutation.isPending}
            title="Reset dataset back to original uploaded state"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Original
          </Button>

          {/* Export Dropdown */}
          <a
            href={cleaningApi.getExportUrl(activeDatasetId, "csv")}
            download
            className="inline-flex items-center justify-center font-semibold rounded-xl text-xs px-3.5 py-2 bg-[#226192] hover:bg-[#1B4F77] text-[#FAF8F5] shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#A9B887]" /> Export Cleaned (CSV)
          </a>
        </div>
      </div>

      {/* Main Cleaning Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Transformation Workspace Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#226192]" />
                <CardTitle>Select Transformation Operation</CardTitle>
              </div>
            </CardHeader>

            {/* Operation Type Tabs */}
            <div className="flex flex-wrap gap-1.5 pb-4 border-b border-[#DAD3C6]">
              {[
                { id: "remove_duplicates", label: "Remove Duplicates" },
                { id: "impute_missing", label: "Impute Missing Values" },
                { id: "drop_columns", label: "Drop Columns" },
                { id: "rename_column", label: "Rename Column" },
                { id: "cast_type", label: "Cast Data Type" },
                { id: "trim_whitespace", label: "Trim Whitespace" },
              ].map((op) => (
                <button
                  key={op.id}
                  onClick={() => setActiveOp(op.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    activeOp === op.id
                      ? "bg-[#226192] text-[#FAF8F5] shadow-xs"
                      : "bg-[#FAF8F5] text-[#5B5245] hover:text-[#133857] hover:bg-[#EAE6DE] border border-[#DAD3C6]"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            {/* Form Panels according to activeOp */}
            <div className="py-4 space-y-4">
              {/* 1. Remove Duplicates */}
              {activeOp === "remove_duplicates" && (
                <div className="space-y-3">
                  <p className="text-xs text-[#5B5245]">
                    Scans all records and deletes identical duplicate rows, retaining the first occurrence.
                  </p>
                  <div className="p-3 bg-[#EAE6DE]/50 rounded-xl text-xs text-[#133857] flex items-center justify-between border border-[#DAD3C6]">
                    <span className="font-medium">Duplicates currently in dataset:</span>
                    <Badge variant={profile?.duplicate_rows_count ? "secondary" : "neutral"}>
                      {profile?.duplicate_rows_count ?? 0} duplicate row(s)
                    </Badge>
                  </div>
                </div>
              )}

              {/* 2. Impute Missing Values */}
              {activeOp === "impute_missing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#133857] block mb-1">Target Column</label>
                      <select
                        value={imputeCol}
                        onChange={(e) => setImputeCol(e.target.value)}
                        className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
                      >
                        <option value="">Select Column...</option>
                        {columns.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#133857] block mb-1">Imputation Strategy</label>
                      <select
                        value={imputeStrategy}
                        onChange={(e) => setImputeStrategy(e.target.value)}
                        className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
                      >
                        <option value="median">Median Imputation (Numeric)</option>
                        <option value="mean">Mean Imputation (Numeric)</option>
                        <option value="mode">Mode / Most Frequent (Categorical)</option>
                        <option value="constant">Constant Fill Value</option>
                        <option value="drop_rows">Drop Rows with Missing Values</option>
                        <option value="drop_column">Drop Entire Column</option>
                      </select>
                    </div>
                  </div>

                  {imputeStrategy === "constant" && (
                    <div>
                      <label className="text-xs font-semibold text-[#133857] block mb-1">Constant Value</label>
                      <input
                        type="text"
                        placeholder="e.g. Unknown or 0"
                        value={imputeFillVal}
                        onChange={(e) => setImputeFillVal(e.target.value)}
                        className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 3. Drop Columns */}
              {activeOp === "drop_columns" && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#133857] block mb-1">
                    Select Columns to Drop
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-[#DAD3C6] rounded-xl bg-[#EAE6DE]/30">
                    {columns.map((col) => {
                      const isSelected = dropCols.includes(col);
                      return (
                        <label
                          key={col}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            isSelected ? "bg-[#226192]/15 border border-[#226192] text-[#133857] font-semibold" : "hover:bg-[#EAE6DE]/60 text-[#5B5245]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setDropCols(
                                isSelected ? dropCols.filter((c) => c !== col) : [...dropCols, col]
                              );
                            }}
                            className="rounded border-[#DAD3C6] text-[#226192] focus:ring-[#226192]"
                          />
                          <span className="truncate">{col}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Rename Column */}
              {activeOp === "rename_column" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#133857] block mb-1">Current Column Name</label>
                    <select
                      value={renameOld}
                      onChange={(e) => setRenameOld(e.target.value)}
                      className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
                    >
                      <option value="">Select Column...</option>
                      {columns.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#133857] block mb-1">New Column Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Total_Revenue"
                      value={renameNew}
                      onChange={(e) => setRenameNew(e.target.value)}
                      className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
                    />
                  </div>
                </div>
              )}

              {/* 5. Cast Data Type */}
              {activeOp === "cast_type" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#133857] block mb-1">Target Column</label>
                    <select
                      value={castCol}
                      onChange={(e) => setCastCol(e.target.value)}
                      className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
                    >
                      <option value="">Select Column...</option>
                      {columns.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#133857] block mb-1">Convert To</label>
                    <select
                      value={castTarget}
                      onChange={(e) => setCastTarget(e.target.value)}
                      className="w-full text-xs bg-[#EAE6DE]/40 border border-[#DAD3C6] rounded-xl p-2.5 text-[#133857] focus:outline-none focus:border-[#226192]"
                    >
                      <option value="float">Floating Point (Numeric)</option>
                      <option value="int">Integer</option>
                      <option value="string">String / Text</option>
                      <option value="datetime">Date & Time</option>
                      <option value="boolean">Boolean</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 6. Trim Whitespace */}
              {activeOp === "trim_whitespace" && (
                <div className="space-y-3">
                  <p className="text-xs text-[#5B5245]">
                    Strips extraneous leading and trailing whitespace from string/text columns.
                  </p>
                </div>
              )}
            </div>

            {/* Preview Button */}
            <div className="pt-4 border-t border-[#DAD3C6] flex justify-end">
              <Button
                variant="primary"
                onClick={handleTriggerPreview}
                isLoading={previewMutation.isPending}
              >
                <Eye className="w-4 h-4 mr-1.5" /> Preview Transformation
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: History & Audit Log */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transformation History</CardTitle>
              <span className="text-xs text-[#5B5245] font-mono font-semibold">{history.length} step(s)</span>
            </CardHeader>
            {history.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#5B5245]">
                No transformations applied yet. Dataset is in original uploaded state.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {history.map((tx, idx) => (
                  <div
                    key={tx.id || idx}
                    className="p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[#133857]">
                      <span className="font-semibold capitalize flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#A9B887]" />
                        {tx.operation.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-[#5B5245] font-mono">{tx.timestamp.slice(11, 19)}</span>
                    </div>
                    <p className="text-[#5B5245] leading-snug">{tx.description}</p>
                    <div className="text-[10px] text-[#226192] font-mono font-semibold">
                      Rows: {tx.rows_before} ➔ {tx.rows_after} • Cols: {tx.cols_before} ➔ {tx.cols_after}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Preview Confirmation Modal */}
      {previewData && pendingStep && (
        <Modal
          isOpen={!!previewData}
          onClose={() => {
            setPreviewData(null);
            setPendingStep(null);
          }}
          title="Preview Transformation Changes"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#EAE6DE]/50 rounded-xl border border-[#DAD3C6]">
                <span className="text-[#5B5245] block mb-0.5 font-medium">Before:</span>
                <span className="font-bold text-[#133857] text-sm">
                  {previewData.original_rows.toLocaleString()} rows • {previewData.original_cols} cols
                </span>
              </div>
              <div className="p-3 bg-[#A9B887]/20 rounded-xl border border-[#A9B887]">
                <span className="text-[#6F804F] block mb-0.5 font-bold">After Transformation:</span>
                <span className="font-bold text-[#133857] text-sm">
                  {previewData.preview_rows.toLocaleString()} rows • {previewData.preview_cols} cols
                </span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-[#133857] mb-1.5">Sample Transformed Records:</h5>
              <div className="border border-[#DAD3C6] rounded-xl overflow-x-auto max-h-56 bg-[#FAF8F5]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EAE6DE] text-[#133857] border-b border-[#DAD3C6] font-semibold">
                    <tr>
                      {Object.keys(previewData.sample_after[0] || {}).map((k) => (
                        <th key={k} className="px-3 py-2 whitespace-nowrap">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DAD3C6]/60">
                    {previewData.sample_after.map((r, i) => (
                      <tr key={i} className="hover:bg-[#EAE6DE]/30 transition-colors">
                        {Object.values(r).map((v: any, j) => (
                          <td key={j} className="px-3 py-1.5 whitespace-nowrap text-[#133857]">{String(v ?? "NULL")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAD3C6]">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setPreviewData(null);
                  setPendingStep(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={applyMutation.isPending}
                onClick={() => applyMutation.mutate(pendingStep)}
              >
                Apply Changes Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns,
  RotateCcw,
  Database,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";

import { useActiveDataset } from "@/hooks/useActiveDataset";
import { explorationApi } from "@/services/api/explorationApi";
import { queryKeys } from "@/services/api/queryKeys";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ColumnFilter, QueryRequest } from "@/types";

export const ExplorerPage: React.FC = () => {
  const { activeDataset, activeDatasetId } = useActiveDataset();

  // Exploration states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [isColMenuOpen, setIsColMenuOpen] = useState(false);

  // Filter creation state
  const [newCol, setNewCol] = useState("");
  const [newOp, setNewOp] = useState("equals");
  const [newVal, setNewVal] = useState("");

  const queryPayload: QueryRequest = {
    page,
    page_size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
    search: searchTerm,
    filters,
    columns: visibleColumns.length > 0 ? visibleColumns : undefined,
  };

  const { data: result, isLoading } = useQuery({
    queryKey: queryKeys.query(activeDatasetId || "", queryPayload),
    queryFn: () => explorationApi.query(activeDatasetId!, queryPayload),
    enabled: !!activeDatasetId,
  });

  if (!activeDatasetId || !activeDataset) {
    return (
      <EmptyState
        icon={Database}
        title="No Active Dataset"
        description="Select or upload a dataset to explore records, search across columns, and apply filters."
      />
    );
  }

  const allColumns = activeDataset.columns;
  const currentColumns = result?.columns || [];

  const handleSort = (colName: string) => {
    if (sortBy === colName) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(colName);
      setSortOrder("asc");
    }
  };

  const handleAddFilter = () => {
    if (!newCol) return;
    setFilters([...filters, { column: newCol, operator: newOp, value: newVal }]);
    setNewCol("");
    setNewVal("");
    setPage(1);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
    setPage(1);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilters([]);
    setSortBy(undefined);
    setSortOrder("asc");
    setVisibleColumns([]);
    setPage(1);
  };

  const toggleColumnVisibility = (colName: string) => {
    const list = visibleColumns.length > 0 ? [...visibleColumns] : [...allColumns];
    if (list.includes(colName)) {
      if (list.length > 1) {
        setVisibleColumns(list.filter((c) => c !== colName));
      }
    } else {
      setVisibleColumns([...list, colName]);
    }
  };

  return (
    <div className="space-y-4 text-[#133857]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#133857] tracking-tight">Data Explorer</h2>
          <p className="text-xs text-[#5B5245]">
            Interactive tabular grid with server-side pagination, multi-column search, and sorting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Column Visibility Selector */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsColMenuOpen(!isColMenuOpen)}
            >
              <Columns className="w-3.5 h-3.5 mr-1 text-[#226192]" />
              Columns
            </Button>
            {isColMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-[#FAF8F5] rounded-xl shadow-lg border border-[#DAD3C6] py-2 z-30 max-h-60 overflow-y-auto"
                onMouseLeave={() => setIsColMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-bold text-[#133857] uppercase tracking-wider">
                  Toggle Visibility
                </div>
                {allColumns.map((c) => {
                  const isChecked =
                    visibleColumns.length === 0 || visibleColumns.includes(c);
                  return (
                    <label
                      key={c}
                      className="flex items-center px-3 py-1.5 text-xs text-[#133857] hover:bg-[#EAE6DE]/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleColumnVisibility(c)}
                        className="rounded border-[#DAD3C6] text-[#226192] focus:ring-[#226192] mr-2"
                      />
                      <span className="truncate">{c}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <Button variant="secondary" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-3.5 space-y-3 bg-[#FAF8F5] border-[#DAD3C6]">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#226192] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search across text fields..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#EAE6DE]/60 border border-[#DAD3C6] rounded-lg focus:outline-none focus:border-[#226192] text-[#133857] placeholder:text-[#5B5245]/60"
            />
          </div>

          {/* Quick Filter Form */}
          <div className="flex items-center gap-2">
            <select
              value={newCol}
              onChange={(e) => setNewCol(e.target.value)}
              className="text-xs bg-[#FAF8F5] border border-[#DAD3C6] rounded-lg px-2.5 py-1.5 text-[#133857] focus:outline-none"
            >
              <option value="">Select Column...</option>
              {allColumns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={newOp}
              onChange={(e) => setNewOp(e.target.value)}
              className="text-xs bg-[#FAF8F5] border border-[#DAD3C6] rounded-lg px-2.5 py-1.5 text-[#133857] focus:outline-none"
            >
              <option value="equals">Equals</option>
              <option value="contains">Contains</option>
              <option value="gt">&gt;</option>
              <option value="lt">&lt;</option>
              <option value="is_null">Is Null</option>
              <option value="not_null">Not Null</option>
            </select>

            {!["is_null", "not_null"].includes(newOp) && (
              <input
                type="text"
                placeholder="Value"
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                className="text-xs bg-[#FAF8F5] border border-[#DAD3C6] rounded-lg px-2.5 py-1.5 text-[#133857] w-28 focus:outline-none"
              />
            )}

            <Button size="sm" variant="outline" onClick={handleAddFilter} disabled={!newCol}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Filter
            </Button>
          </div>
        </div>

        {/* Active Filters List */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DAD3C6]">
            <span className="text-[11px] text-[#5B5245] font-semibold">Applied Filters:</span>
            {filters.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#A9B887]/20 text-[#133857] text-xs rounded-md border border-[#A9B887]/40 font-medium"
              >
                <span>
                  <b>{f.column}</b> {f.operator} {f.value ?? ""}
                </span>
                <button onClick={() => handleRemoveFilter(i)} className="hover:text-[#226192]">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Paginated Data Grid */}
      <Card className="p-0 overflow-hidden border-[#DAD3C6] shadow-xs bg-[#FAF8F5]">
        <div className="overflow-x-auto max-h-[580px]">
          <table className="w-full text-left text-xs text-[#133857]">
            <thead className="bg-[#EAE6DE] text-[#133857] font-semibold uppercase tracking-wider sticky top-0 z-10 border-b border-[#DAD3C6]">
              <tr>
                {currentColumns.map((col) => {
                  const isSorted = sortBy === col.name;
                  return (
                    <th
                      key={col.name}
                      onClick={() => handleSort(col.name)}
                      className="px-4 py-3 cursor-pointer hover:bg-[#FAF8F5] transition-colors select-none whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.name}</span>
                        {isSorted ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="w-3.5 h-3.5 text-[#226192]" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-[#226192]" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3.5 h-3.5 text-[#DAD3C6] opacity-60" />
                        )}
                        <span className="text-[9px] font-normal text-[#5B5245] lowercase ml-1">
                          ({col.inferred_type})
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DAD3C6]/60 bg-[#FAF8F5]">
              {isLoading ? (
                <tr>
                  <td colSpan={currentColumns.length} className="p-8 text-center text-[#5B5245]">
                    Loading records...
                  </td>
                </tr>
              ) : result?.rows.length === 0 ? (
                <tr>
                  <td colSpan={currentColumns.length} className="p-8 text-center text-[#5B5245]">
                    No matching records found. Try modifying your search or filters.
                  </td>
                </tr>
              ) : (
                result?.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-[#EAE6DE]/40 transition-colors">
                    {currentColumns.map((col) => {
                      const val = row[col.name];
                      const isNull = val === null || val === undefined;
                      return (
                        <td key={col.name} className="px-4 py-2.5 whitespace-nowrap text-[#133857]">
                          {isNull ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#EAE6DE] text-[#5B5245] border border-[#DAD3C6]">
                              NULL
                            </span>
                          ) : (
                            <span>{String(val)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#DAD3C6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5B5245]">
          <div>
            Showing <b className="text-[#133857]">{result?.rows.length || 0}</b> of <b className="text-[#133857]">{result?.filtered_rows.toLocaleString() || 0}</b> records
            {result && result.filtered_rows !== result.total_rows && (
              <span className="text-[#5B5245] ml-1">
                (filtered from {result.total_rows.toLocaleString()})
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[#5B5245]">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#EAE6DE]/50 border border-[#DAD3C6] text-[#133857] rounded-lg px-2 py-1 text-xs focus:outline-none"
              >
                {[10, 25, 50, 100].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-[#DAD3C6] hover:bg-[#EAE6DE] text-[#133857] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-[#133857]">
                Page {result?.page || 1} of {result?.total_pages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(result?.total_pages || 1, p + 1))}
                disabled={!result || page >= result.total_pages}
                className="p-1.5 rounded-lg border border-[#DAD3C6] hover:bg-[#EAE6DE] text-[#133857] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { datasetsApi } from "@/services/api/datasetsApi";
import { queryKeys } from "@/services/api/queryKeys";
import { DatasetMeta } from "@/types";

interface ActiveDatasetContextType {
  activeDatasetId: string | null;
  activeDataset: DatasetMeta | null;
  datasets: DatasetMeta[];
  isLoadingDatasets: boolean;
  setActiveDatasetId: (id: string | null) => void;
  setActiveDataset: (dataset: DatasetMeta | null) => void;
}

const ActiveDatasetContext = createContext<ActiveDatasetContextType | undefined>(undefined);
const STORAGE_KEY = "dataagent_active_dataset_id";

export const ActiveDatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [activeDatasetId, setActiveDatasetIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });
  const [activeDatasetOverride, setActiveDatasetOverride] = useState<DatasetMeta | null>(null);

  const { data: datasets = [], isLoading, isFetching } = useQuery({
    queryKey: queryKeys.datasets,
    queryFn: datasetsApi.list,
  });

  const setActiveDatasetId = (id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setActiveDatasetIdState(id);
    if (!id) {
      setActiveDatasetOverride(null);
    }
  };

  const setActiveDataset = (meta: DatasetMeta | null) => {
    if (meta) {
      localStorage.setItem(STORAGE_KEY, meta.id);
      setActiveDatasetIdState(meta.id);
      setActiveDatasetOverride(meta);
      // Immediately hydrate TanStack Query cache so all components see it synchronously
      queryClient.setQueryData<DatasetMeta[]>(queryKeys.datasets, (old = []) => [
        meta,
        ...(old || []).filter((d: DatasetMeta) => d.id !== meta.id),
      ]);
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setActiveDatasetIdState(null);
      setActiveDatasetOverride(null);
    }
  };

  // Synchronize activeDatasetId safely when datasets change
  useEffect(() => {
    if (datasets.length > 0) {
      // If active ID is not set or not in datasets (and not overridden), select first available
      if (!activeDatasetId) {
        setActiveDatasetId(datasets[0].id);
      } else if (!datasets.some((d) => d.id === activeDatasetId) && activeDatasetOverride?.id !== activeDatasetId && !isFetching) {
        setActiveDatasetId(datasets[0].id);
      }
    } else if (activeDatasetId && datasets.length === 0 && !isLoading && !isFetching && !activeDatasetOverride) {
      setActiveDatasetId(null);
    }
  }, [datasets, activeDatasetId, isLoading, isFetching, activeDatasetOverride]);

  // Robust activeDataset resolution:
  // 1. Direct match in query datasets
  // 2. Active dataset override from recent upload/demo
  // 3. Fallback to first available dataset if any exists
  const activeDataset =
    datasets.find((d) => d.id === activeDatasetId) ||
    (activeDatasetOverride?.id === activeDatasetId ? activeDatasetOverride : null) ||
    (datasets.length > 0 ? datasets[0] : null);

  const resolvedActiveId = activeDataset?.id || activeDatasetId;

  return (
    <ActiveDatasetContext.Provider
      value={{
        activeDatasetId: resolvedActiveId,
        activeDataset,
        datasets,
        isLoadingDatasets: isLoading,
        setActiveDatasetId,
        setActiveDataset,
      }}
    >
      {children}
    </ActiveDatasetContext.Provider>
  );
};

export function useActiveDatasetContext() {
  const context = useContext(ActiveDatasetContext);
  if (!context) {
    throw new Error("useActiveDatasetContext must be used within an ActiveDatasetProvider");
  }
  return context;
}

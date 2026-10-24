import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { datasetsApi } from "@/services/api/datasetsApi";
import { queryKeys } from "@/services/api/queryKeys";
import { DatasetMeta } from "@/types";

interface ActiveDatasetContextType {
  activeDatasetId: string | null;
  activeDataset: DatasetMeta | null;
  datasets: DatasetMeta[];
  isLoadingDatasets: boolean;
  setActiveDatasetId: (id: string | null) => void;
}

const ActiveDatasetContext = createContext<ActiveDatasetContextType | undefined>(undefined);
const STORAGE_KEY = "dataagent_active_dataset_id";

export const ActiveDatasetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDatasetId, setActiveDatasetIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) || null;
  });

  const { data: datasets = [], isLoading } = useQuery({
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
  };

  // Synchronize activeDatasetId safely when datasets change
  useEffect(() => {
    if (datasets.length > 0) {
      if (!activeDatasetId || !datasets.some((d) => d.id === activeDatasetId)) {
        setActiveDatasetId(datasets[0].id);
      }
    } else if (activeDatasetId && datasets.length === 0 && !isLoading) {
      setActiveDatasetId(null);
    }
  }, [datasets, activeDatasetId, isLoading]);

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || null;

  return (
    <ActiveDatasetContext.Provider
      value={{
        activeDatasetId,
        activeDataset,
        datasets,
        isLoadingDatasets: isLoading,
        setActiveDatasetId,
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

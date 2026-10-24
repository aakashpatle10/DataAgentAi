import { apiClient } from "./client";
import {
  TransformationStep,
  TransformationPreviewResponse,
  TransformationHistoryItem,
} from "@/types";

export const cleaningApi = {
  preview: async (
    datasetId: string,
    step: TransformationStep
  ): Promise<TransformationPreviewResponse> => {
    const res = await apiClient.post<TransformationPreviewResponse>(
      `/datasets/${datasetId}/transformations/preview`,
      step
    );
    return res.data;
  },

  apply: async (
    datasetId: string,
    step: TransformationStep
  ): Promise<TransformationHistoryItem> => {
    const res = await apiClient.post<TransformationHistoryItem>(
      `/datasets/${datasetId}/transformations`,
      step
    );
    return res.data;
  },

  getHistory: async (datasetId: string): Promise<TransformationHistoryItem[]> => {
    const res = await apiClient.get<TransformationHistoryItem[]>(
      `/datasets/${datasetId}/transformations`
    );
    return res.data;
  },

  undo: async (datasetId: string): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(`/datasets/${datasetId}/undo`);
    return res.data;
  },

  reset: async (datasetId: string): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>(`/datasets/${datasetId}/reset`);
    return res.data;
  },

  getExportUrl: (datasetId: string, format = "csv"): string => {
    const baseURL = apiClient.defaults.baseURL || "http://localhost:8000/api";
    return `${baseURL}/datasets/${datasetId}/export?format=${format}`;
  },
};

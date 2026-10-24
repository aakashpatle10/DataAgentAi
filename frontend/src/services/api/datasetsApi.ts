import { apiClient } from "./client";
import { DatasetMeta, DatasetPreviewResponse, ColumnSchema, SystemHealth } from "@/types";

export const datasetsApi = {
  getHealth: async (): Promise<SystemHealth> => {
    const res = await apiClient.get<SystemHealth>("/health");
    return res.data;
  },

  list: async (): Promise<DatasetMeta[]> => {
    const res = await apiClient.get<DatasetMeta[]>("/datasets");
    return res.data;
  },

  get: async (datasetId: string): Promise<DatasetMeta> => {
    const res = await apiClient.get<DatasetMeta>(`/datasets/${datasetId}`);
    return res.data;
  },

  getPreview: async (datasetId: string): Promise<DatasetPreviewResponse> => {
    const res = await apiClient.get<DatasetPreviewResponse>(`/datasets/${datasetId}/preview`);
    return res.data;
  },

  getSchema: async (datasetId: string): Promise<ColumnSchema[]> => {
    const res = await apiClient.get<ColumnSchema[]>(`/datasets/${datasetId}/schema`);
    return res.data;
  },

  upload: async (file: File): Promise<DatasetPreviewResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<DatasetPreviewResponse>("/datasets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  loadDemo: async (): Promise<DatasetPreviewResponse> => {
    const res = await apiClient.post<DatasetPreviewResponse>("/datasets/demo");
    return res.data;
  },

  delete: async (datasetId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/datasets/${datasetId}`);
    return res.data;
  },

  getDashboardSummary: async (datasetId: string): Promise<any> => {
    const res = await apiClient.get<any>(`/datasets/${datasetId}/dashboard-summary`);
    return res.data;
  },

  getExportUrl: (datasetId: string): string => {
    const baseURL = apiClient.defaults.baseURL || "http://localhost:8000/api";
    return `${baseURL}/datasets/${datasetId}/export`;
  },
};


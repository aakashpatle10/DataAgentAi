import { apiClient } from "./client";
import { DatasetProfileResponse, QualityIssue } from "@/types";

export const profilingApi = {
  getProfile: async (datasetId: string): Promise<DatasetProfileResponse> => {
    const res = await apiClient.get<DatasetProfileResponse>(`/datasets/${datasetId}/profile`);
    return res.data;
  },

  getQuality: async (datasetId: string): Promise<QualityIssue[]> => {
    const res = await apiClient.get<QualityIssue[]>(`/datasets/${datasetId}/quality`);
    return res.data;
  },
};

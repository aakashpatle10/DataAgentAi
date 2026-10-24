import { apiClient } from "./client";
import { ChartConfigRequest, ChartResponse, ChartRecommendation } from "@/types";

export const chartsApi = {
  create: async (datasetId: string, cfg: ChartConfigRequest): Promise<ChartResponse> => {
    const res = await apiClient.post<ChartResponse>(`/datasets/${datasetId}/charts`, cfg);
    return res.data;
  },

  getRecommendations: async (datasetId: string): Promise<ChartRecommendation[]> => {
    const res = await apiClient.get<ChartRecommendation[]>(`/datasets/${datasetId}/charts/recommend`);
    return res.data;
  },
};

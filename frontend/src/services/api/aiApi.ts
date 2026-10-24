import { apiClient } from "./client";
import { AiStatusResponse, AiChatResponse } from "@/types";

export const aiApi = {
  getStatus: async (): Promise<AiStatusResponse> => {
    const res = await apiClient.get<AiStatusResponse>("/ai/status");
    return res.data;
  },

  chat: async (datasetId: string, message: string): Promise<AiChatResponse> => {
    const res = await apiClient.post<AiChatResponse>(`/ai/${datasetId}/chat`, {
      message,
    });
    return res.data;
  },

  getHistory: async (datasetId: string): Promise<any[]> => {
    const res = await apiClient.get<any[]>(`/ai/${datasetId}/history`);
    return res.data;
  },

  clearHistory: async (datasetId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/ai/${datasetId}/history`);
    return res.data;
  },
};


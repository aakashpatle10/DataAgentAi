import { apiClient } from "./client";
import { QueryRequest, QueryResponse } from "@/types";

export const explorationApi = {
  query: async (datasetId: string, req: QueryRequest): Promise<QueryResponse> => {
    const res = await apiClient.post<QueryResponse>(`/datasets/${datasetId}/query`, req);
    return res.data;
  },
};

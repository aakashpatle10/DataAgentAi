import { apiClient } from "./client";
import { ReportGenerateRequest, ReportMeta } from "@/types";

export const reportsApi = {
  generate: async (datasetId: string, req: ReportGenerateRequest): Promise<ReportMeta> => {
    const res = await apiClient.post<ReportMeta>(`/${datasetId}/reports`, req);
    return res.data;
  },

  getReport: async (reportId: string): Promise<ReportMeta> => {
    const res = await apiClient.get<ReportMeta>(`/reports/${reportId}`);
    return res.data;
  },

  getDownloadUrl: (reportId: string): string => {
    const baseURL = apiClient.defaults.baseURL || "http://localhost:8000/api";
    return `${baseURL}/reports/${reportId}/download`;
  },
};

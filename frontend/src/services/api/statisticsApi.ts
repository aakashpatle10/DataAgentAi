import { apiClient } from "./client";
import {
  DescriptiveStatsItem,
  CorrelationResponse,
  OutlierReport,
  GroupAnalysisResponse,
  LinearRegressionResponse,
} from "@/types";

export const statisticsApi = {
  getStats: async (datasetId: string): Promise<DescriptiveStatsItem[]> => {
    const res = await apiClient.post<DescriptiveStatsItem[]>(`/datasets/${datasetId}/statistics`);
    return res.data;
  },

  getCorrelations: async (datasetId: string): Promise<CorrelationResponse> => {
    const res = await apiClient.post<CorrelationResponse>(`/datasets/${datasetId}/correlations`);
    return res.data;
  },

  getOutliers: async (datasetId: string, column?: string): Promise<OutlierReport> => {
    const params = column ? { column } : undefined;
    const res = await apiClient.post<OutlierReport>(`/datasets/${datasetId}/outliers`, null, {
      params,
    });
    return res.data;
  },

  getGroupAnalysis: async (
    datasetId: string,
    groupBy: string,
    metricColumn: string
  ): Promise<GroupAnalysisResponse> => {
    const res = await apiClient.post<GroupAnalysisResponse>(`/datasets/${datasetId}/group-analysis`, {
      group_by: groupBy,
      metric_column: metricColumn,
    });
    return res.data;
  },

  getRegression: async (
    datasetId: string,
    xColumn: string,
    yColumn: string
  ): Promise<LinearRegressionResponse> => {
    const res = await apiClient.post<LinearRegressionResponse>(`/datasets/${datasetId}/regression`, {
      x_column: xColumn,
      y_column: yColumn,
    });
    return res.data;
  },
};

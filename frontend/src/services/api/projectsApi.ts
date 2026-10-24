import { apiClient } from "./client";

export interface ProjectSavePayload {
  dataset_id: string;
  name: string;
  notes?: string;
  summary_snapshot?: any;
}

export const projectsApi = {
  save: async (payload: ProjectSavePayload): Promise<any> => {
    const res = await apiClient.post<any>("/projects/save", payload);
    return res.data;
  },

  list: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>("/projects");
    return res.data;
  },
};

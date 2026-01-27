import { api } from "./client";

export type AnalysisListItem = {
  file_name: string;
  file_hash: string;
  cache_used?: boolean;
  has_analysis: boolean;
};

export type AnalysesResponse = {
  analyses: AnalysisListItem[];
  total: number;
  limit: number;
  skip: number;
};

export async function listAnalyses(limit = 20, skip = 0) {
  const res = await api.get<AnalysesResponse>("/analyses", {
    params: { limit, skip },
  });
  return res.data;
}

export async function getAnalysis(file_hash: string) {
  const res = await api.get(`/analysis/${file_hash}`);
  return res.data; // returns full stored doc (includes analysis)
}

export async function deleteAnalysis(file_hash: string) {
  const res = await api.delete(`/analysis/${file_hash}`);
  return res.data;
}

import { api } from "./client";
import type { ConceptState as ConceptStatus } from "@/components/atlas";

export type MemoryConcept = {
  key: string;
  name: string;
  definition?: string | null;
  status: "known" | "learning";
  source: "user" | "inferred";
  confidence?: number;
  updated_at?: string;
};

export type Memory = {
  field: string | null;
  depth: "beginner" | "intermediate" | "expert" | null;
  onboarded: boolean;
  concepts: MemoryConcept[];
  interests: { name: string; weight: number }[];
  episodes: { id: string; summary: string; paper_ids: string[]; updated_at: string }[];
};

export type PaperConcept = {
  key: string;
  name: string;
  definition?: string | null;
  difficulty?: number | null;
  role: "prerequisite" | "core" | "contribution" | "related";
  status: ConceptStatus;
  source?: "user" | "inferred" | null;
};

export const memoryAPI = {
  get: async () => (await api.get<Memory>("/v2/me/memory")).data,
  paperConcepts: async (paperId: string) => (await api.get<PaperConcept[]>(`/v2/me/papers/${paperId}/concepts`)).data,
  setConcept: async (name: string, status: ConceptStatus) => (await api.put("/v2/me/concepts", { name, status })).data,
  setPreferences: async (prefs: { field?: string; depth?: Memory["depth"]; [extra: string]: unknown }) =>
    (await api.put("/v2/me/preferences", prefs)).data,
  forgetInterest: async (name: string) => (await api.delete(`/v2/me/interests/${encodeURIComponent(name)}`)).data,
  forgetEpisode: async (id: string) => (await api.delete(`/v2/me/episodes/${encodeURIComponent(id)}`)).data,
  forgetAll: async () => (await api.delete("/v2/me/memory")).data,
};

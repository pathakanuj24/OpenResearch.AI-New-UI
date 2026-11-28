import { api } from "./client";

export type IngestStage = "queued" | "parsing" | "classifying" | "enriching" | "writing" | "done" | "failed";

export type IngestJob = {
  job_id: string;
  paper_id?: string;
  stage: IngestStage;
  status: "queued" | "running" | "done" | "failed";
  progress: number; // 0..1
  detail?: string;
  error?: string;
  result?: {
    paper_id: string;
    title: string;
    field: string;
    subfield?: string | null;
    openalex_id?: string | null;
    chunks: number;
    concepts: number;
    relations: number;
    references: number;
    resolved_references: number;
  };
};

export type PaperGraphStats = {
  title: string;
  field: string;
  chunks: number;
  concepts: number;
  citations: number;
  resolved_citations: number;
  topics: number;
};

export async function getIngestJob(jobId: string) {
  return (await api.get<IngestJob>(`/v2/jobs/${jobId}`)).data;
}

export async function getPaperGraphStats(paperId: string) {
  return (await api.get<PaperGraphStats>(`/v2/papers/${paperId}/graph`)).data;
}

export async function reingestPaper(paperId: string) {
  return (await api.post<{ job_id: string }>(`/v2/papers/${paperId}/reingest`)).data;
}

export type Resource = {
  url: string;
  title: string;
  kind: "video" | "article" | "paper" | "course";
  source: string;
  why: string;
  duration?: string | null;
  concept?: string;
};

export type ConceptResources = { concept: string; status: string; role: string; resources: Resource[] };

export async function getPaperResources(paperId: string, limit = 4) {
  return (await api.get<ConceptResources[]>(`/v2/papers/${paperId}/resources`, { params: { limit } })).data;
}

export type MapConcept = {
  key: string;
  name: string;
  definition?: string | null;
  difficulty?: number | null;
  role: "prerequisite" | "core" | "contribution" | "related";
  depth: number;
  status: "known" | "learning" | "new";
  requires: string[];
};

export type MapWork = {
  id: string; title: string; year?: number | null; cited_by?: number | null; url?: string | null;
  openalex_id?: string | null; doi?: string | null; // used to fetch an open-access copy ("Add to library")
};

/** One-click "Add to library": the server finds an open-access PDF via OpenAlex and queues it like an upload. */
export async function addPaperFromWork(w: { openalex_id?: string | null; doi?: string | null }) {
  // Downloading a large PDF from a publisher can take a while.
  return (await api.post<{ paper_id: string; job_id: string | null }>("/v2/papers/from-work",
    { openalex_id: w.openalex_id ?? null, doi: w.doi ?? null }, { timeout: 120_000 })).data;
}

export type LearningMapData = {
  paper: { id: string; title: string; year?: number | null; field?: string | null; openalex_id?: string | null };
  concepts: MapConcept[];
  progress: { known: number; total: number };
  before: MapWork[];
  after: MapWork[];
};

export async function getLearningMap(paperId: string, onlyNew = false) {
  return (await api.get<LearningMapData>(`/v2/papers/${paperId}/map`, { params: { only_new: onlyNew } })).data;
}

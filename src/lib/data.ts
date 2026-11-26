"use client";

import { useMemo } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { listAnalyses, getAnalysis, deleteAnalysis } from "@/lib/api/analysis";
import { analyzePaper } from "@/lib/api/papers";
import { getIngestJob, getLearningMap, getPaperGraphStats, getPaperResources, reingestPaper, type IngestJob } from "@/lib/api/v2";
import { memoryAPI, type PaperConcept } from "@/lib/api/memory";
import type { ConceptState } from "@/components/atlas";
import { track } from "@/lib/track";

const isMissing = (e: unknown) => [404, 405].includes((e as { response?: { status?: number } })?.response?.status ?? 0);

// ---------------- library ----------------

export type ShelfPaper = {
  id: string;
  title: string;
  fileName?: string;
  field?: string | null;
  subfield?: string | null;
  year?: number | null;
  authors?: string[];
  status: "ready" | "processing" | "failed" | "unmapped";
  error?: string | null;
  jobId?: string | null;
  concepts?: { total: number; known: number; learning: number; new: number };
};

/** Library: GET /v2/papers when the backend has it, else /analyses + per-paper graph stats and concepts. */
export function useLibrary() {
  const jobs = useJobs((s) => s.jobs);
  const v2 = useQuery({
    queryKey: ["library-v2"],
    queryFn: async () => {
      try {
        return (await api.get<ShelfPaper[]>("/v2/papers")).data;
      } catch (e) {
        if (isMissing(e)) return null; // endpoint not deployed yet → fallback
        throw e;
      }
    },
    staleTime: 15_000,
  });
  const v1 = useQuery({
    queryKey: ["analyses", 100],
    queryFn: () => listAnalyses(100, 0),
    enabled: v2.isFetched && v2.data === null,
  });
  const ids = v1.data?.analyses.map((a) => a.file_hash) ?? [];
  const stats = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["graph-stats", id],
      queryFn: async () => { try { return await getPaperGraphStats(id); } catch (e) { if (isMissing(e)) return null; throw e; } },
      staleTime: 60_000,
    })),
  });
  const concepts = useQueries({
    queries: ids.map((id, i) => ({
      queryKey: ["paper-concepts", id],
      queryFn: () => memoryAPI.paperConcepts(id),
      enabled: Boolean(stats[i]?.data),
      staleTime: 30_000,
    })),
  });

  let papers: ShelfPaper[] | undefined;
  if (v2.data) papers = v2.data;
  else if (v1.data) {
    papers = v1.data.analyses.map((a, i) => {
      const s = stats[i]?.data;
      const c = concepts[i]?.data;
      const job = jobs.find((j) => j.paperId === a.file_hash);
      return {
        id: a.file_hash,
        title: s?.title || a.file_name?.replace(/\.pdf$/i, "") || "Untitled paper",
        fileName: a.file_name,
        field: s?.field ?? null,
        status: s ? "ready" : job && job.status !== "failed" ? "processing" : job?.status === "failed" ? "failed" : "unmapped",
        error: job?.error ?? null,
        jobId: job?.jobId ?? null,
        concepts: c ? countStates(c) : undefined,
      };
    });
  }
  // Uploads still in flight that the server doesn't list yet.
  const pending: ShelfPaper[] = jobs
    .filter((j) => !j.paperId || !papers?.some((p) => p.id === j.paperId))
    .map((j) => ({ id: j.paperId ?? j.key, title: j.fileName.replace(/\.pdf$/i, ""), status: j.status === "failed" ? "failed" : "processing", error: j.error, jobId: j.jobId }));

  return {
    papers: papers ? [...pending, ...papers] : undefined,
    isLoading: v2.isLoading || (v2.data === null && v1.isLoading),
    error: v2.error || v1.error,
  };
}

export function countStates(list: { status: ConceptState | string }[]) {
  const c = { total: list.length, known: 0, learning: 0, new: 0 };
  for (const x of list) {
    if (x.status === "known") c.known++;
    else if (x.status === "learning") c.learning++;
    else c.new++;
  }
  return c;
}

// ---------------- paper ----------------

export function useAnalysis(id?: string) {
  return useQuery({ queryKey: ["analysis", id], queryFn: () => getAnalysis(id!), enabled: Boolean(id), staleTime: 5 * 60_000 });
}

export function useGraphStats(id?: string) {
  return useQuery({
    queryKey: ["graph-stats", id],
    queryFn: async () => { try { return await getPaperGraphStats(id!); } catch (e) { if (isMissing(e)) return null; throw e; } },
    enabled: Boolean(id),
  });
}

export type Passage = { id: string; ordinal: number; page_start: number; page_end: number; text: string; concepts?: { key: string; name: string }[] };
export type Section = { title: string; page_start: number; passages: Passage[] };

/** Reflowable text; null when the backend doesn't serve passages yet (UI falls back to the PDF). */
export function usePassages(id?: string) {
  return useQuery({
    queryKey: ["passages", id],
    queryFn: async () => {
      try { return (await api.get<{ sections: Section[] }>(`/v2/papers/${id}/passages`)).data; }
      catch (e) { if (isMissing(e)) return null; throw e; }
    },
    enabled: Boolean(id),
    staleTime: 10 * 60_000,
  });
}

export function useMap(id?: string, onlyNew = false) {
  return useQuery({
    queryKey: ["learning-map", id, onlyNew],
    queryFn: async () => { try { return await getLearningMap(id!, onlyNew); } catch (e) { if (isMissing(e)) return null; throw e; } },
    enabled: Boolean(id),
  });
}

export function usePaperResources(id?: string, limit = 5) {
  return useQuery({
    queryKey: ["paper-resources", id, limit],
    queryFn: () => getPaperResources(id!, limit),
    enabled: Boolean(id),
    staleTime: 10 * 60_000,
    retry: false,
  });
}

// ---------------- memory / concept states ----------------

export function useMemory() {
  return useQuery({ queryKey: ["memory"], queryFn: memoryAPI.get, retry: false, staleTime: 30_000 });
}

export function usePaperConcepts(id?: string) {
  return useQuery({ queryKey: ["paper-concepts", id], queryFn: () => memoryAPI.paperConcepts(id!), enabled: Boolean(id), retry: false });
}

/** Set a concept's state everywhere (optimistic for the paper list; refreshes memory, map and shelf). */
export function useSetConcept(paperId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, state }: { name: string; state: ConceptState }) => memoryAPI.setConcept(name, state),
    onMutate: async ({ name, state }) => {
      const key = ["paper-concepts", paperId];
      const prev = qc.getQueryData<PaperConcept[]>(key);
      if (prev) qc.setQueryData<PaperConcept[]>(key, prev.map((c) => (c.name.toLowerCase() === name.toLowerCase() ? { ...c, status: state, source: "user" } : c)));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["paper-concepts", paperId], ctx.prev);
      toast.error("Couldn't save that. Try again.");
    },
    onSuccess: (_d, { name, state }) => {
      track({ type: "concept_state", concept: name, paper_id: paperId, value: state });
      if (state === "known") toast(`Stamped: ${name}`);
    },
    onSettled: () => {
      for (const k of [["memory"], ["learning-map"], ["paper-concepts"], ["paper-resources"]]) qc.invalidateQueries({ queryKey: k });
    },
  });
}

// ---------------- uploads and ingestion jobs ----------------

type Job = {
  key: string; fileName: string; paperId?: string; jobId?: string | null;
  status: "uploading" | "analysing" | "mapping" | "done" | "failed"; progress: number; error?: string | null; stage?: string;
};

type JobsState = {
  jobs: Job[];
  upsert: (key: string, patch: Partial<Job>) => void;
  remove: (key: string) => void;
};

export const useJobs = create<JobsState>()(
  persist(
    (set) => ({
      jobs: [],
      upsert: (key, patch) => set((s) => {
        const i = s.jobs.findIndex((j) => j.key === key);
        if (i === -1) return { jobs: [{ key, fileName: "paper.pdf", status: "uploading", progress: 0, ...patch }, ...s.jobs] };
        const jobs = [...s.jobs];
        jobs[i] = { ...jobs[i], ...patch };
        return { jobs };
      }),
      remove: (key) => set((s) => ({ jobs: s.jobs.filter((j) => j.key !== key) })),
    }),
    { name: "openresearch-jobs", partialize: (s) => ({ jobs: s.jobs.filter((j) => j.status === "mapping" || j.status === "failed") }) },
  ),
);

/** Upload a PDF: analysis (v1) + graph mapping (v2 job). Keeps running across navigation. */
export function useUpload() {
  const qc = useQueryClient();
  const upsert = useJobs((s) => s.upsert);
  return async (file: File) => {
    if (file.type !== "application/pdf") { toast.error("That isn't a PDF. Choose a PDF file."); return null; }
    if (file.size > 50 * 1024 * 1024) { toast.error("That PDF is over 50 MB. Try a smaller file."); return null; }
    const key = `${file.name}-${Date.now()}`;
    upsert(key, { fileName: file.name, status: "uploading", progress: 0, stage: "Uploading" });
    try {
      // Preferred: v2 upload stores the PDF and returns at once; mapping runs in the background.
      const fd = new FormData();
      fd.append("file", file);
      let paperId: string | null = null; let jobId: string | null = null;
      try {
        const r = await api.post<{ paper_id: string; job_id: string | null }>("/v2/papers", fd, {
          onUploadProgress: (e) => e.total && upsert(key, { progress: Math.round((100 * e.loaded) / e.total), stage: "Uploading" }),
        });
        paperId = r.data.paper_id; jobId = r.data.job_id;
      } catch (e) {
        if ((e as { response?: { status?: number } })?.response?.status !== 503) throw e;
        // Server without graph ingestion: fall back to the slower v1 analysis.
        const res = await analyzePaper(file, (pct) =>
          upsert(key, { progress: pct, status: pct < 30 ? "uploading" : "analysing", stage: pct < 30 ? "Uploading" : "Reading the paper" }));
        paperId = res.file_hash; jobId = res.graph_job_id ?? null;
      }
      upsert(key, { paperId, jobId, status: jobId ? "mapping" : "done", progress: 0, stage: "Queued" });
      qc.invalidateQueries({ queryKey: ["analyses"] });
      qc.invalidateQueries({ queryKey: ["library-v2"] });
      if (!jobId) useJobs.getState().remove(key);
      return paperId;
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      upsert(key, { status: "failed", error: detail || "Upload failed. Check your connection and try again." });
      toast.error(detail || "Upload failed.");
      return null;
    }
  };
}

/** Polls every mapping job; when one finishes, refreshes the library and drops it from the list. */
export function useJobPolling() {
  // Select the stable array, then filter: a selector that builds a new array re-renders forever.
  const all = useJobs((s) => s.jobs);
  const jobs = useMemo(() => all.filter((j) => j.status === "mapping" && j.jobId), [all]);
  const qc = useQueryClient();
  useQueries({
    queries: jobs.map((j) => ({
      queryKey: ["ingest-job", j.jobId],
      queryFn: async (): Promise<IngestJob> => {
        const job = await getIngestJob(j.jobId!);
        const st = useJobs.getState();
        if (job.status === "done") {
          st.remove(j.key);
          for (const k of ["graph-stats", "paper-concepts", "learning-map", "passages", "paper-resources", "analysis"]) qc.invalidateQueries({ queryKey: [k, j.paperId] });
          qc.invalidateQueries({ queryKey: ["library-v2"] });
          qc.invalidateQueries({ queryKey: ["analyses"] });
          toast.success(`${job.result?.title ?? j.fileName} is mapped. Your trail is ready.`);
        } else if (job.status === "failed") {
          st.upsert(j.key, { status: "failed", error: job.error ?? "Mapping failed." });
        } else {
          st.upsert(j.key, { stage: job.detail ?? job.stage, progress: Math.round(job.progress * 100) });
        }
        return job;
      },
      refetchInterval: 2500,
    })),
  });
}

export function useReingest() {
  const upsert = useJobs((s) => s.upsert);
  return useMutation({
    mutationFn: (p: { id: string; title: string }) => reingestPaper(p.id),
    onSuccess: (r, p) => { upsert(`reingest-${p.id}`, { fileName: p.title, paperId: p.id, jobId: r.job_id, status: "mapping", progress: 0, stage: "Queued" }); },
    onError: () => toast.error("Couldn't start mapping. Try again."),
  });
}

export function useDeletePaper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAnalysis(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["analyses"] }); qc.invalidateQueries({ queryKey: ["library-v2"] }); toast("Paper deleted."); },
    onError: () => toast.error("Couldn't delete the paper."),
  });
}

/** Last paper opened, for "Continue" and the Today hero. */
export const useLastPaper = create<{ id?: string; set: (id: string) => void }>()(
  persist((set) => ({ id: undefined, set: (id) => set({ id }) }), { name: "openresearch-last-paper" }),
);

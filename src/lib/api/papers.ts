import { api } from "./client";

export type AnalyzeResponse = {
  graph_job_id?: string; // v2 graph ingestion job (GET /v2/jobs/{id})
  file_name: string;
  file_hash: string;
  cache_used?: boolean;
  cache_id?: string;
  analysis: {
    document_summary: {
      title: string;
      authors: string[];
      main_topic: string;
      key_findings: string[];
      document_type?: string;
      plain_language_summary?: string;
    };
    glossary?: {
      technical_terms: Array<{ term: string; definition: string }>;
    };
  };
};

export async function analyzePaper(
  file: File,
  onProgress?: (pct: number) => void,
  abortSignal?: AbortSignal
) {
  const fd = new FormData();
  fd.append("file", file);

  let uploadDone = false;
  let analyzingTimer: ReturnType<typeof setInterval> | null = null;
  let pct = 0;
  let startTime = 0;

  const startAnalyzingProgress = () => {
    // Smoothly creep from 30 → 95 while backend processes
    // Use logarithmic curve to slow down as we approach 95%
    pct = Math.max(pct, 30);
    startTime = Date.now();

    analyzingTimer = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000; // seconds
      
      // Logarithmic progress: fast at start, slows down over time
      // Will reach ~70% in 10s, ~85% in 30s, ~92% in 60s, caps at 95%
      const targetProgress = 30 + (65 * (1 - Math.exp(-elapsed / 25)));
      pct = Math.min(95, targetProgress);
      
      onProgress?.(Math.floor(pct));
    }, 500);
  };

  try {
    const res = await api.post<AnalyzeResponse>("/analyze", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0, // no timeout for this request
      signal: abortSignal, // allow cancellation
      onUploadProgress: (evt) => {
        if (!evt.total) return;
        const next = Math.round((evt.loaded * 100) / evt.total);

        // Map upload 0..100 → 0..30 (upload is fast, analysis takes longer)
        pct = Math.min(30, Math.round(next * 0.3));
        onProgress?.(pct);

        if (next >= 100 && !uploadDone) {
          uploadDone = true;
          // Start "analyzing..." creep with realistic timing
          startAnalyzingProgress();
        }
      },
    });

    // Request finished → complete progress
    if (analyzingTimer) clearInterval(analyzingTimer);
    onProgress?.(100);

    return res.data;
  } catch (e) {
    if (analyzingTimer) clearInterval(analyzingTimer);
    throw e;
  }
}

import { api } from "./client";

export type AnalyzeResponse = {
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

export async function analyzePaper(file: File, onProgress?: (pct: number) => void) {
  const fd = new FormData();
  fd.append("file", file);

  let uploadDone = false;
  let analyzingTimer: ReturnType<typeof setInterval> | null = null;
  let pct = 0;

  const startAnalyzingProgress = () => {
    // Smoothly creep from 90 → 99 while backend processes
    pct = Math.max(pct, 90);
    analyzingTimer = setInterval(() => {
      pct = Math.min(99, pct + Math.random() * 1.2); // small increments
      onProgress?.(Math.floor(pct));
    }, 450);
  };

  try {
    const res = await api.post<AnalyzeResponse>("/analyze", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 0, // ✅ no timeout for this request too
      onUploadProgress: (evt) => {
        if (!evt.total) return;
        const next = Math.round((evt.loaded * 100) / evt.total);

        // Map upload 0..100 → 0..90 so we leave room for "analyzing"
        pct = Math.min(90, Math.round(next * 0.9));
        onProgress?.(pct);

        if (next >= 100 && !uploadDone) {
          uploadDone = true;
          // Start "analyzing..." creep
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

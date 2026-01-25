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

  const res = await api.post<AnalyzeResponse>("http://localhost:8001/analyze", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (!evt.total) return;
      onProgress?.(Math.round((evt.loaded * 100) / evt.total));
    },
  });

  return res.data;
}

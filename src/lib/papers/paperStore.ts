import { create } from "zustand";
import type { AnalyzeResponse } from "@/lib/api/papers";

type PaperState = {
  lastAnalyze?: AnalyzeResponse;
  setLastAnalyze: (p: AnalyzeResponse) => void;
  clear: () => void;
};

export const usePaperStore = create<PaperState>((set) => ({
  lastAnalyze: undefined,
  setLastAnalyze: (p) => set({ lastAnalyze: p }),
  clear: () => set({ lastAnalyze: undefined }),
}));

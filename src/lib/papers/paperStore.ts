import { create } from "zustand";
import type { AnalyzeResponse } from "@/lib/api/papers";

// Upload state that persists across navigation
type UploadState = {
  file: File | null;
  progress: number;
  isUploading: boolean;
  error: string | null;
  abortController: AbortController | null;
};

type PaperState = {
  lastAnalyze?: AnalyzeResponse;
  setLastAnalyze: (p: AnalyzeResponse) => void;
  clear: () => void;

  // Upload state
  upload: UploadState;
  setUploadFile: (file: File | null) => void;
  setUploadProgress: (progress: number) => void;
  setUploadError: (error: string | null) => void;
  startUpload: (abortController: AbortController) => void;
  finishUpload: () => void;
  resetUpload: () => void;
};

const initialUploadState: UploadState = {
  file: null,
  progress: 0,
  isUploading: false,
  error: null,
  abortController: null,
};

export const usePaperStore = create<PaperState>((set, get) => ({
  lastAnalyze: undefined,
  setLastAnalyze: (p) => set({ lastAnalyze: p }),
  clear: () => set({ lastAnalyze: undefined }),

  // Upload state management
  upload: initialUploadState,

  setUploadFile: (file) =>
    set((state) => ({
      upload: { ...state.upload, file, error: null },
    })),

  setUploadProgress: (progress) =>
    set((state) => ({
      upload: { ...state.upload, progress },
    })),

  setUploadError: (error) =>
    set((state) => ({
      upload: { ...state.upload, error, isUploading: false },
    })),

  startUpload: (abortController) =>
    set((state) => ({
      upload: {
        ...state.upload,
        isUploading: true,
        error: null,
        progress: 0,
        abortController,
      },
    })),

  finishUpload: () =>
    set((state) => ({
      upload: {
        ...state.upload,
        isUploading: false,
        progress: 100,
        abortController: null,
      },
    })),

  resetUpload: () => {
    const { upload } = get();
    // Cancel any ongoing upload
    if (upload.abortController) {
      upload.abortController.abort();
    }
    set({ upload: initialUploadState });
  },
}));

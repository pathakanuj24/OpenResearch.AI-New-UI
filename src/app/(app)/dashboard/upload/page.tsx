"use client";

import { useEffect, useCallback, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import PaperUploader from "@/components/upload/PaperUploader";
import { analyzePaper } from "@/lib/api/papers";
import { usePaperStore } from "@/lib/papers/paperStore";

export default function UploadPage() {
  const router = useRouter();
  const uploadRef = useRef<Promise<void> | null>(null);

  // Use global store for upload state (persists across navigation)
  const {
    upload,
    setUploadFile,
    setUploadProgress,
    setUploadError,
    startUpload,
    finishUpload,
    resetUpload,
    setLastAnalyze,
  } = usePaperStore();

  const { file, progress, isUploading, error } = upload;

  // Handle the upload process
  const handleUpload = useCallback(async () => {
    if (!file || isUploading) return;

    const abortController = new AbortController();
    startUpload(abortController);

    try {
      const data = await analyzePaper(
        file,
        (pct) => setUploadProgress(pct),
        abortController.signal
      );

      finishUpload();
      setLastAnalyze(data);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        resetUpload();
        router.push(`/dashboard/library/${data.file_hash}`);
      }, 500);
    } catch (e: any) {
      // Don't show error if it was intentionally cancelled
      if (e?.name === "CanceledError" || e?.name === "AbortError") {
        return;
      }
      setUploadError(e?.message || "Upload failed. Please try again.");
    }
  }, [
    file,
    isUploading,
    startUpload,
    setUploadProgress,
    finishUpload,
    setLastAnalyze,
    resetUpload,
    setUploadError,
    router,
  ]);

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 620 }}>
        <Typography sx={{ fontWeight: 950, fontSize: 22, mb: 0.5, textAlign: "center" }}>
          Upload Research Paper
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}>
          Upload a PDF and instantly get summary + glossary.
        </Typography>

        <PaperUploader
          file={file}
          error={error}
          isLoading={isUploading}
          progress={progress}
          onPick={(f) => setUploadFile(f)}
          onClear={() => resetUpload()}
          onUpload={handleUpload}
        />
      </Box>
    </Box>
  );
}

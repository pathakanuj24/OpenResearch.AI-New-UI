"use client";

import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import PaperUploader from "@/components/upload/PaperUploader";
import { analyzePaper } from "@/lib/api/papers";
import { usePaperStore } from "@/lib/papers/paperStore";

export default function UploadPage() {
  const router = useRouter();
  const setLastAnalyze = usePaperStore((s) => s.setLastAnalyze);

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select a PDF");
      setError(null);
      setProgress(0);
      return analyzePaper(file, (pct) => setProgress(pct));
    },
    onSuccess: (data) => {
      setLastAnalyze(data);
      router.push(`/dashboard/library/${data.file_hash}`);
    },
    onError: (e: any) => {
      setError(e?.message || "Upload failed. Please try again.");
    },
  });

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
          Upload Paper
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3, textAlign: "center" }}>
          Upload a PDF and instantly get summary + glossary.
        </Typography>

        <PaperUploader
          file={file}
          error={error}
          isLoading={upload.isPending}
          progress={progress}
          onPick={(f) => {
            setError(null);
            setFile(f);
          }}
          onClear={() => {
            setError(null);
            setProgress(0);
            setFile(null);
          }}
          onUpload={() => upload.mutate()}
        />
      </Box>
    </Box>
  );

}

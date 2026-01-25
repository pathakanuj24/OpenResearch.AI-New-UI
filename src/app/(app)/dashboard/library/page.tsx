"use client";

import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAnalyses } from "@/lib/hooks/useAnalyses";

export default function LibraryPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useAnalyses(20, 0);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 950, fontSize: 22 }}>Library</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Your analyzed papers appear here.
          </Typography>
        </Box>

        <Button variant="contained" onClick={() => router.push("/dashboard/upload")}>
          Upload Paper
        </Button>
      </Stack>

      {isLoading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={18} />
          <Typography sx={{ color: "text.secondary" }}>Loading…</Typography>
        </Stack>
      )}

      {isError && (
        <Typography sx={{ color: "error.main" }}>
          Failed to load library. Check login/token and API base URL.
        </Typography>
      )}

      {!isLoading && data?.analyses?.length === 0 && (
        <Typography sx={{ color: "text.secondary" }}>
          No papers yet. Upload your first PDF.
        </Typography>
      )}

      <Stack spacing={1.2} sx={{ mt: 2 }}>
        {data?.analyses?.map((p) => (
          <Box
            key={p.file_hash}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: "white",
              border: "1px solid rgba(0,0,0,0.06)",
              cursor: "pointer",
              "&:hover": { borderColor: "rgba(26,115,232,0.25)" },
            }}
            onClick={() => router.push(`/dashboard/library/${p.file_hash}`)}
          >
            <Typography sx={{ fontWeight: 950 }}>
              {p.file_name || p.file_hash}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13, mt: 0.5 }}>
              {p.file_hash}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

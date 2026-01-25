"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box, Chip, Divider, Stack, Tab, Tabs, Typography,
  Button, CircularProgress
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAnalysis } from "@/lib/hooks/useAnalysis";
import { deleteAnalysis } from "@/lib/api/analysis";

export default function PaperDetailsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const params = useParams<{ file_hash: string }>();
  const file_hash = params.file_hash;

  const { data: paper, isLoading, isError } = useAnalysis(file_hash);
  const [tab, setTab] = useState(0);

  const del = useMutation({
    mutationFn: () => deleteAnalysis(file_hash),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["analyses"] });
      router.push("/dashboard/library");
    },
  });

  const ds = paper?.analysis?.document_summary;
  const glossary = paper?.analysis?.glossary?.technical_terms || [];

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography sx={{ fontWeight: 950, fontSize: 20 }} noWrap>
          {ds?.title || paper?.file_name || file_hash}
        </Typography>
        <Chip size="small" label={file_hash} />
        {paper?.cache_used && <Chip size="small" label="Cached" />}
        <Box sx={{ flex: 1 }} />
        <Button
          color="error"
          variant="text"
          onClick={() => del.mutate()}
          disabled={del.isPending}
        >
          {del.isPending ? "Deleting..." : "Delete"}
        </Button>
      </Stack>

      <Typography sx={{ color: "text.secondary", mb: 2 }}>
        Summary and glossary extracted from your paper.
      </Typography>

      {isLoading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={18} />
          <Typography sx={{ color: "text.secondary" }}>Loading analysis…</Typography>
        </Stack>
      )}

      {isError && (
        <Typography sx={{ color: "error.main" }}>
          Could not load analysis. (Check token / API URL / backend logs)
        </Typography>
      )}

      {paper && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          {/* PDF placeholder */}
          <Box
            sx={{
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 3,
              bgcolor: "white",
              p: 2,
              minHeight: 520,
            }}
          >
            <Typography sx={{ fontWeight: 950, mb: 0.5 }}>PDF Viewer</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              We’ll connect this once backend provides a PDF fetch endpoint.
            </Typography>
          </Box>

          {/* Summary / Glossary */}
          <Box
            sx={{
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 3,
              bgcolor: "white",
              overflow: "hidden",
            }}
          >
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <Tab label="Summary" />
              <Tab label="Glossary" />
            </Tabs>

            <Box sx={{ p: 2 }}>
              {tab === 0 && (
                <Stack spacing={1.4}>
                  <Typography sx={{ fontWeight: 950 }}>Main topic</Typography>
                  <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                    {ds?.main_topic || "—"}
                  </Typography>

                  <Divider />

                  <Typography sx={{ fontWeight: 950 }}>Plain language summary</Typography>
                  <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                    {ds?.plain_language_summary || "—"}
                  </Typography>

                  <Divider />

                  <Typography sx={{ fontWeight: 950 }}>Key findings</Typography>
                  <Stack spacing={1}>
                    {(ds?.key_findings || []).map((k: string) => (
                      <Typography key={k} sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                        • {k}
                      </Typography>
                    ))}
                  </Stack>

                  <Divider />

                  <Typography sx={{ fontWeight: 950 }}>Authors</Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {(ds?.authors || []).join(", ") || "—"}
                  </Typography>
                </Stack>
              )}

              {tab === 1 && (
                <Stack spacing={1.2}>
                  {glossary.length === 0 ? (
                    <Typography sx={{ color: "text.secondary" }}>No glossary found.</Typography>
                  ) : (
                    glossary.map((g: any, idx: number) => (
                      <Box
                        key={`${g.term}-${idx}`}
                        sx={{ p: 1.4, borderRadius: 2.5, bgcolor: "rgba(0,0,0,0.02)" }}
                      >
                        <Typography sx={{ fontWeight: 950 }}>{g.term}</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 13, lineHeight: 1.6 }}>
                          {g.definition}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

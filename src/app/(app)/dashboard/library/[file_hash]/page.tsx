"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Chip,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Person,
  CalendarToday,
  MenuBook,
  OpenInNew,
  ArrowBackRounded,
  DeleteOutlineRounded,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAnalysis } from "@/lib/hooks/useAnalysis";
import { deleteAnalysis } from "@/lib/api/analysis";
import PaperViewer from "@/components/papers/PaperViewer";

// Generate topic tags from analysis
function extractTags(analysis: any): string[] {
  const tags: string[] = [];
  const ds = analysis?.document_summary;

  if (ds?.main_topic) {
    // Extract key terms from main topic
    const topic = ds.main_topic.toLowerCase();
    if (topic.includes("transformer")) tags.push("Transformers");
    if (topic.includes("attention")) tags.push("Attention Mechanism");
    if (topic.includes("nlp") || topic.includes("language")) tags.push("NLP");
    if (topic.includes("deep learning") || topic.includes("neural")) tags.push("Deep Learning");
    if (topic.includes("translation")) tags.push("Machine Translation");
    if (topic.includes("computer vision") || topic.includes("image")) tags.push("Computer Vision");
    if (topic.includes("reinforcement")) tags.push("Reinforcement Learning");
  }

  // Add document type as tag if available
  if (ds?.document_type) {
    tags.push(ds.document_type);
  }

  // Fallback tags if none extracted
  if (tags.length === 0) {
    tags.push("Research Paper");
  }

  return [...new Set(tags)].slice(0, 5);
}

// Extract year from analysis or filename
function extractYear(analysis: any, fileName: string): string {
  // Try to extract from any year-like pattern in the data
  const ds = analysis?.document_summary;
  if (ds?.publication_year) return ds.publication_year;

  // Try filename
  const yearMatch = fileName?.match(/20\d{2}|19\d{2}/);
  if (yearMatch) return yearMatch[0];

  return "—";
}

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
  const references = paper?.analysis?.references || [];
  const tags = paper ? extractTags(paper.analysis) : [];
  const year = paper ? extractYear(paper.analysis, paper.file_name) : "—";

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackRounded sx={{ fontSize: 18 }} />}
        onClick={() => router.push("/dashboard/library")}
        sx={{
          mb: 2,
          color: "text.secondary",
          fontWeight: 500,
          fontSize: 14,
          "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
        }}
      >
        Back to Library
      </Button>

      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: 20, md: 24 },
              lineHeight: 1.3,
              mb: 0.5,
            }}
          >
            {ds?.title || paper?.file_name?.replace(".pdf", "") || "Paper Details"}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            AI-powered summary and glossary extracted from your paper.
          </Typography>
        </Box>

        <Button
          color="error"
          variant="outlined"
          startIcon={<DeleteOutlineRounded sx={{ fontSize: 18 }} />}
          onClick={() => del.mutate()}
          disabled={del.isPending}
          sx={{
            fontWeight: 500,
            borderRadius: 2,
            borderColor: "rgba(239,68,68,0.3)",
            "&:hover": {
              borderColor: "error.main",
              bgcolor: "rgba(239,68,68,0.04)",
            },
          }}
        >
          {del.isPending ? "Deleting..." : "Delete Paper"}
        </Button>
      </Stack>

      {isLoading && (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={18} />
          <Typography sx={{ color: "text.secondary" }}>
            Loading analysis...
          </Typography>
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
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* LEFT: PDF Viewer */}
          <Box
            sx={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 3,
              bgcolor: "white",
              minHeight: 520,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <PaperViewer fileHash={file_hash} />
          </Box>

          {/* RIGHT: Paper Metadata & Info */}
          <Stack spacing={3}>
            {/* Paper Info Card */}
            <Box
              sx={{
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 3,
                bgcolor: "white",
                p: 3,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Title */}
              <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2, lineHeight: 1.4 }}>
                {ds?.title || paper?.file_name || "Untitled Paper"}
              </Typography>

              {/* Authors */}
              <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 1.5 }}>
                <Person sx={{ fontSize: 18, color: "text.secondary", mt: 0.3 }} />
                <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.6 }}>
                  {(ds?.authors || []).join(", ") || "Unknown authors"}
                </Typography>
              </Stack>

              {/* Year */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
                <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                  {year}
                </Typography>
              </Stack>

              {/* Tags */}
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      bgcolor: "rgba(33, 150, 243, 0.08)",
                      color: "primary.main",
                      fontWeight: 500,
                      fontSize: 12,
                      borderRadius: 2,
                      border: "1px solid rgba(33, 150, 243, 0.2)",
                    }}
                  />
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* Abstract */}
              <Typography sx={{ fontWeight: 600, fontSize: 15, mb: 1.5 }}>
                Abstract
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: 14,
                  lineHeight: 1.7,
                  textAlign: "justify",
                }}
              >
                {ds?.plain_language_summary || ds?.main_topic || "No abstract available."}
              </Typography>
            </Box>

            {/* References Card */}
            {references.length > 0 && (
              <Box
                sx={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 3,
                  bgcolor: "white",
                  p: 3,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <MenuBook sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                    References ({references.length})
                  </Typography>
                </Stack>

                <Stack spacing={1.5}>
                  {references.slice(0, 5).map((ref: any, idx: number) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        p: 1.5,
                        bgcolor: "rgba(0,0,0,0.02)",
                        borderRadius: 2,
                        "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "text.secondary",
                          minWidth: 28,
                          fontWeight: 500,
                        }}
                      >
                        [{idx + 1}]
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.4 }}>
                          {ref.title || ref.text || `Reference ${idx + 1}`}
                        </Typography>
                        {ref.authors && (
                          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>
                            {ref.authors} {ref.year && `• ${ref.year}`}
                          </Typography>
                        )}
                      </Box>
                      {ref.url && (
                        <IconButton
                          size="small"
                          href={ref.url}
                          target="_blank"
                          sx={{ color: "text.secondary" }}
                        >
                          <OpenInNew sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Summary & Glossary Tabs */}
            <Box
              sx={{
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 3,
                bgcolor: "white",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                  px: 1,
                  "& .MuiTab-root": {
                    fontSize: 14,
                    fontWeight: 500,
                    textTransform: "none",
                    minHeight: 48,
                  },
                }}
              >
                <Tab label="Summary" />
                <Tab label="Glossary" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {tab === 0 && (
                  <Stack spacing={2}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
                        Main topic
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.7 }}>
                        {ds?.main_topic || "—"}
                      </Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
                        Plain language summary
                      </Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.7 }}>
                        {ds?.plain_language_summary || "—"}
                      </Typography>
                    </Box>

                    {(ds?.key_findings || []).length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1 }}>
                            Key findings
                          </Typography>
                          <Stack spacing={0.5}>
                            {(ds?.key_findings || []).map((k: string, idx: number) => (
                              <Typography
                                key={idx}
                                sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.7 }}
                              >
                                • {k}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      </>
                    )}
                  </Stack>
                )}

                {tab === 1 && (
                  <Stack spacing={1.5}>
                    {glossary.length === 0 ? (
                      <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                        No glossary found.
                      </Typography>
                    ) : (
                      glossary.map((g: any, idx: number) => (
                        <Box
                          key={`${g.term}-${idx}`}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "rgba(0,0,0,0.02)",
                          }}
                        >
                          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 0.5 }}>
                            {g.term}
                          </Typography>
                          <Typography
                            sx={{ color: "text.secondary", fontSize: 13, lineHeight: 1.6 }}
                          >
                            {g.definition}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Stack>
                )}
              </Box>
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

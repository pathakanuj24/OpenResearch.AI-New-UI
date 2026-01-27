"use client";

import { useState, useMemo, memo, useCallback } from "react";
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
  Card,
  TextField,
  InputAdornment,
  Tooltip,
  Avatar,
  Collapse,
  LinearProgress,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalysis } from "@/lib/hooks/useAnalysis";
import { deleteAnalysis } from "@/lib/api/analysis";
import PaperViewer from "@/components/papers/PaperViewer";

// Generate topic tags from analysis
function extractTags(analysis: any): string[] {
  const tags: string[] = [];
  const ds = analysis?.document_summary;

  if (ds?.main_topic) {
    const topic = ds.main_topic.toLowerCase();
    if (topic.includes("transformer")) tags.push("Transformers");
    if (topic.includes("attention")) tags.push("Attention Mechanism");
    if (topic.includes("nlp") || topic.includes("language")) tags.push("NLP");
    if (topic.includes("deep learning") || topic.includes("neural")) tags.push("Deep Learning");
    if (topic.includes("translation")) tags.push("Machine Translation");
    if (topic.includes("computer vision") || topic.includes("image")) tags.push("Computer Vision");
    if (topic.includes("reinforcement")) tags.push("Reinforcement Learning");
  }

  if (ds?.document_type) {
    tags.push(ds.document_type);
  }

  if (tags.length === 0) {
    tags.push("Research Paper");
  }

  return [...new Set(tags)].slice(0, 5);
}

function extractYear(analysis: any, fileName: string): string {
  const ds = analysis?.document_summary;
  if (ds?.publication_year) return ds.publication_year;

  const yearMatch = fileName?.match(/20\d{2}|19\d{2}/);
  if (yearMatch) return yearMatch[0];

  return "—";
}

// Quick action button component
const QuickActionButton = memo(function QuickActionButton({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <Tooltip title={label}>
      <IconButton
        onClick={onClick}
        sx={{
          bgcolor: `${color}10`,
          color: color,
          "&:hover": { bgcolor: `${color}20` },
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </IconButton>
    </Tooltip>
  );
});

// Key finding card component
const KeyFindingCard = memo(function KeyFindingCard({
  finding,
  index,
}: {
  finding: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        elevation={0}
        sx={{
          p: 2,
          border: "1px solid rgba(26,115,232,0.1)",
          borderLeft: "3px solid #1a73e8",
          bgcolor: "rgba(26,115,232,0.02)",
          borderRadius: 2,
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {index + 1}
          </Box>
          <Typography sx={{ fontSize: 14, lineHeight: 1.6, color: "text.secondary" }}>
            {finding}
          </Typography>
        </Stack>
      </Card>
    </motion.div>
  );
});

// Glossary term card component
const GlossaryTermCard = memo(function GlossaryTermCard({
  term,
  definition,
  index,
}: {
  term: string;
  definition: string;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${term}: ${definition}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [term, definition]);

  const isLong = definition.length > 150;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        elevation={0}
        sx={{
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 2.5,
          overflow: "hidden",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: "0 4px 20px rgba(26,115,232,0.08)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "rgba(26,115,232,0.1)",
                  color: "primary.main",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {term[0]?.toUpperCase()}
              </Avatar>
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{term}</Typography>
            </Stack>
            <Tooltip title={copied ? "Copied!" : "Copy"}>
              <IconButton size="small" onClick={handleCopy} sx={{ color: "text.secondary" }}>
                {copied ? (
                  <CheckRoundedIcon sx={{ fontSize: 16 }} />
                ) : (
                  <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          </Stack>

          <Box sx={{ mt: 1.5, pl: 5.5 }}>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: 13,
                lineHeight: 1.7,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: expanded ? "unset" : 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {definition}
            </Typography>

            {isLong && (
              <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                endIcon={
                  <KeyboardArrowDownRoundedIcon
                    sx={{
                      transform: expanded ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                }
                sx={{ mt: 0.5, fontSize: 12, textTransform: "none" }}
              >
                {expanded ? "Show less" : "Read more"}
              </Button>
            )}
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
});

// Reference card component
const ReferenceCard = memo(function ReferenceCard({
  reference,
  index,
}: {
  reference: any;
  index: number;
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",
        "&:hover": {
          bgcolor: "rgba(0,0,0,0.02)",
          borderColor: "rgba(0,0,0,0.1)",
        },
      }}
    >
      <Stack direction="row" spacing={2}>
        <Typography
          sx={{
            fontSize: 12,
            color: "primary.main",
            fontWeight: 600,
            minWidth: 28,
          }}
        >
          [{index + 1}]
        </Typography>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, mb: 0.5 }}>
            {reference.title || reference.text || `Reference ${index + 1}`}
          </Typography>
          {reference.authors && (
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {reference.authors} {reference.year && `• ${reference.year}`}
            </Typography>
          )}
        </Box>
        {reference.url && (
          <IconButton
            size="small"
            href={reference.url}
            target="_blank"
            component="a"
            sx={{ color: "primary.main" }}
          >
            <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
});

export default function PaperDetailsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const params = useParams<{ file_hash: string }>();
  const file_hash = params.file_hash;

  const { data: paper, isLoading, isError } = useAnalysis(file_hash);
  const [tab, setTab] = useState(0);
  const [glossarySearch, setGlossarySearch] = useState("");
  const [showAllReferences, setShowAllReferences] = useState(false);

  const del = useMutation({
    mutationFn: () => deleteAnalysis(file_hash),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["analyses"] });
      router.push("/dashboard/library");
    },
  });

  const ds = paper?.analysis?.document_summary;
  const glossary = useMemo(
    () => paper?.analysis?.glossary?.technical_terms || [],
    [paper?.analysis?.glossary?.technical_terms]
  );
  const references = useMemo(() => paper?.analysis?.references || [], [paper?.analysis?.references]);
  const tags = useMemo(() => (paper ? extractTags(paper.analysis) : []), [paper]);
  const year = useMemo(
    () => (paper ? extractYear(paper.analysis, paper.file_name) : "—"),
    [paper]
  );

  // Filtered glossary based on search
  const filteredGlossary = useMemo(() => {
    if (!glossarySearch) return glossary;
    const query = glossarySearch.toLowerCase();
    return glossary.filter(
      (g: any) =>
        g.term?.toLowerCase().includes(query) || g.definition?.toLowerCase().includes(query)
    );
  }, [glossary, glossarySearch]);

  const visibleReferences = showAllReferences ? references : references.slice(0, 5);

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} />
          <Typography sx={{ color: "text.secondary" }}>Loading paper analysis...</Typography>
        </Stack>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <DescriptionRoundedIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
        <Typography sx={{ color: "error.main", fontWeight: 600, mb: 1 }}>
          Could not load paper
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          Please check your connection and try again.
        </Typography>
        <Button variant="outlined" onClick={() => router.push("/dashboard/library")}>
          Back to Library
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.push("/dashboard/library")}
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          Back to Library
        </Button>

        <Stack direction="row" spacing={1}>
          <QuickActionButton
            icon={ChatRoundedIcon}
            label="Chat about this paper"
            color="#1a73e8"
            onClick={() => router.push("/dashboard/chat")}
          />
          <QuickActionButton
            icon={SchoolRoundedIcon}
            label="Learning resources"
            color="#7c3aed"
            onClick={() => router.push(`/dashboard/learn?paper=${file_hash}`)}
          />
          <QuickActionButton
            icon={HubRoundedIcon}
            label="Knowledge graph"
            color="#ea580c"
            onClick={() => router.push(`/dashboard/graph?paper=${file_hash}`)}
          />
        </Stack>
      </Stack>

      {/* Title Card */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 3,
          background: "linear-gradient(135deg, rgba(26,115,232,0.03) 0%, rgba(99,102,241,0.05) 100%)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-start" }}
          spacing={2}
        >
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 22, lineHeight: 1.4, mb: 1.5 }}>
              {ds?.title || paper?.file_name?.replace(".pdf", "") || "Paper Details"}
            </Typography>

            {/* Authors */}
            <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mb: 1 }}>
              <PersonRoundedIcon sx={{ fontSize: 18, color: "text.secondary", mt: 0.2 }} />
              <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.5 }}>
                {(ds?.authors || []).join(", ") || "Unknown authors"}
              </Typography>
            </Stack>

            {/* Year */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>{year}</Typography>
            </Stack>

            {/* Tags */}
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{
                    bgcolor: "rgba(26,115,232,0.1)",
                    color: "primary.main",
                    fontWeight: 500,
                    fontSize: 12,
                    border: "1px solid rgba(26,115,232,0.2)",
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={() => del.mutate()}
            disabled={del.isPending}
            sx={{ borderRadius: 2, fontWeight: 500, flexShrink: 0 }}
          >
            {del.isPending ? "Deleting..." : "Delete"}
          </Button>
        </Stack>
      </Card>

      {paper && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1.2fr 0.8fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* LEFT: PDF Viewer */}
          <Card
            elevation={0}
            sx={{
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 3,
              overflow: "hidden",
              minHeight: 600,
            }}
          >
            <PaperViewer fileHash={file_hash} />
          </Card>

          {/* RIGHT: Summary, Glossary, References */}
          <Stack spacing={3}>
            {/* Tabs */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  bgcolor: "rgba(0,0,0,0.02)",
                  "& .MuiTab-root": {
                    fontSize: 14,
                    fontWeight: 600,
                    textTransform: "none",
                    minHeight: 52,
                  },
                }}
              >
                <Tab
                  icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                  label="Summary"
                />
                <Tab
                  icon={<MenuBookRoundedIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                  label={`Glossary (${glossary.length})`}
                />
              </Tabs>

              <AnimatePresence mode="wait">
                {tab === 0 && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Box sx={{ p: 3 }}>
                      {/* Plain Language Summary */}
                      <Box sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                          <LightbulbRoundedIcon sx={{ fontSize: 18, color: "warning.main" }} />
                          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                            Plain Language Summary
                          </Typography>
                        </Stack>
                        <Card
                          elevation={0}
                          sx={{
                            p: 2.5,
                            bgcolor: "rgba(251,191,36,0.06)",
                            border: "1px solid rgba(251,191,36,0.15)",
                            borderRadius: 2.5,
                          }}
                        >
                          <Typography sx={{ fontSize: 14, lineHeight: 1.8, color: "text.primary" }}>
                            {ds?.plain_language_summary || "No summary available."}
                          </Typography>
                        </Card>
                      </Box>

                      {/* Main Topic */}
                      <Box sx={{ mb: 3 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 1, color: "text.secondary" }}>
                          Main Topic
                        </Typography>
                        <Typography sx={{ fontSize: 14, lineHeight: 1.7 }}>
                          {ds?.main_topic || "—"}
                        </Typography>
                      </Box>

                      {/* Key Findings */}
                      {(ds?.key_findings || []).length > 0 && (
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 14, mb: 2, color: "text.secondary" }}>
                            Key Findings
                          </Typography>
                          <Stack spacing={1.5}>
                            {(ds?.key_findings || []).map((finding: string, idx: number) => (
                              <KeyFindingCard key={idx} finding={finding} index={idx} />
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </motion.div>
                )}

                {tab === 1 && (
                  <motion.div
                    key="glossary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Box sx={{ p: 3 }}>
                      {/* Search */}
                      <TextField
                        placeholder="Search terms..."
                        size="small"
                        fullWidth
                        value={glossarySearch}
                        onChange={(e) => setGlossarySearch(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      {filteredGlossary.length === 0 ? (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                          <Typography sx={{ color: "text.secondary" }}>
                            {glossarySearch ? "No terms found" : "No glossary available"}
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={1.5}>
                          {filteredGlossary.map((g: any, idx: number) => (
                            <GlossaryTermCard
                              key={`${g.term}-${idx}`}
                              term={g.term}
                              definition={g.definition}
                              index={idx}
                            />
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* References Card */}
            {references.length > 0 && (
              <Card
                elevation={0}
                sx={{
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "rgba(0,0,0,0.02)",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FormatQuoteRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                    <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                      References ({references.length})
                    </Typography>
                  </Stack>
                </Box>

                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    {visibleReferences.map((ref: any, idx: number) => (
                      <ReferenceCard key={idx} reference={ref} index={idx} />
                    ))}
                  </Stack>

                  {references.length > 5 && (
                    <Button
                      fullWidth
                      onClick={() => setShowAllReferences(!showAllReferences)}
                      endIcon={
                        <KeyboardArrowDownRoundedIcon
                          sx={{
                            transform: showAllReferences ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s",
                          }}
                        />
                      }
                      sx={{ mt: 2, textTransform: "none", fontWeight: 500 }}
                    >
                      {showAllReferences ? "Show less" : `Show all ${references.length} references`}
                    </Button>
                  )}
                </Box>
              </Card>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}

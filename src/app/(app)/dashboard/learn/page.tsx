"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  LinearProgress,
  Dialog,
  DialogContent,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PlayCircleFilledRoundedIcon from "@mui/icons-material/PlayCircleFilledRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { learningAPI, RecommendedResource } from "@/lib/api/learning";
import { useAnalyses } from "@/lib/hooks/useAnalyses";

// Resource type icons
const resourceTypeIcons: Record<string, any> = {
  paper: ArticleRoundedIcon,
  video: PlayCircleFilledRoundedIcon,
  article: MenuBookRoundedIcon,
  course: SchoolRoundedIcon,
  tutorial: SchoolRoundedIcon,
  blog: ArticleRoundedIcon,
};

// Resource card component
function ResourceCard({
  resource,
  onView,
}: {
  resource: RecommendedResource;
  onView: (resource: RecommendedResource) => void;
}) {
  const Icon = resourceTypeIcons[resource.resource_type] || ArticleRoundedIcon;
  const relevancePercent = Math.round(resource.relevance_score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 3,
          transition: "all 0.2s ease",
          cursor: "pointer",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: "0 4px 20px rgba(26,115,232,0.1)",
            transform: "translateY(-2px)",
          },
        }}
        onClick={() => onView(resource)}
      >
        <Stack direction="row" spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: "rgba(26,115,232,0.08)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: "primary.main" }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 15,
                mb: 0.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {resource.title}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                label={resource.resource_type}
                size="small"
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  bgcolor: "rgba(0,0,0,0.04)",
                }}
              />
              {resource.author && (
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  by {resource.author}
                </Typography>
              )}
              {resource.duration && (
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  • {resource.duration}
                </Typography>
              )}
            </Stack>

            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                lineHeight: 1.6,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {resource.explanation}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1.5 }}>
              <Box sx={{ flex: 1, maxWidth: 120 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.3 }}>
                  <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                    Relevance
                  </Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 600 }}>
                    {relevancePercent}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={relevancePercent}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: "rgba(0,0,0,0.06)",
                  }}
                />
              </Box>

              {resource.url && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(resource.url, "_blank");
                  }}
                  sx={{ color: "text.secondary" }}
                >
                  <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Stack>
          </Box>
        </Stack>
      </Card>
    </motion.div>
  );
}

// Embedded content viewer
function EmbeddedViewer({
  resource,
  open,
  onClose,
}: {
  resource: RecommendedResource | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!resource) return null;

  const isYouTube = resource.url?.includes("youtube.com") || resource.url?.includes("youtu.be");
  const youtubeId = isYouTube
    ? resource.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1]
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent sx={{ p: 0, height: "80vh" }}>
        <Stack sx={{ height: "100%" }}>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{resource.title}</Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                {resource.resource_type}
                {resource.author && ` • ${resource.author}`}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {resource.url && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<OpenInNewRoundedIcon />}
                  onClick={() => window.open(resource.url, "_blank")}
                  sx={{ borderRadius: 2 }}
                >
                  Open External
                </Button>
              )}
              <Button
                variant="contained"
                size="small"
                onClick={onClose}
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
            </Stack>
          </Stack>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {isYouTube && youtubeId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={resource.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : resource.url ? (
              <iframe
                src={resource.url}
                width="100%"
                height="100%"
                frameBorder="0"
                title={resource.title}
              />
            ) : (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography sx={{ color: "text.secondary" }}>
                  No preview available for this resource.
                </Typography>
                <Typography sx={{ mt: 2, fontSize: 14, lineHeight: 1.8 }}>
                  {resource.explanation}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default function LearnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperHash = searchParams.get("paper");

  const [activeTab, setActiveTab] = useState(0);
  const [viewingResource, setViewingResource] = useState<RecommendedResource | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch papers to get paper info
  const { data: analysesData } = useAnalyses(50, 0);
  const selectedPaper = analysesData?.analyses?.find((p) => p.file_hash === paperHash);

  // Fetch recommendations
  const {
    data: recommendations,
    isLoading: loadingRecommendations,
    error: recommendationsError,
  } = useQuery({
    queryKey: ["recommendations", paperHash],
    queryFn: () => learningAPI.getRecommendations(paperHash!),
    enabled: !!paperHash,
  });

  // No paper selected - show paper selector as full page
  if (!paperHash) {
    const papers = analysesData?.analyses || [];
    const hasPapers = papers.length > 0;
    
    const filteredPapers = papers.filter((paper) =>
      paper.file_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!hasPapers) {
      return (
        <Box
          sx={{
            height: "calc(100vh - 140px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Card
            elevation={0}
            sx={{ p: 6, textAlign: "center", maxWidth: 400, border: "1px dashed rgba(0,0,0,0.15)" }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
            <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>
              No Papers Yet
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              Upload and chat about a paper to get personalized learning recommendations.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<ChatRoundedIcon />}
                onClick={() => router.push("/dashboard/chat")}
                sx={{ borderRadius: 2.5, fontWeight: 600 }}
              >
                Start Chat
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/dashboard/upload")}
                sx={{ borderRadius: 2.5, fontWeight: 600 }}
              >
                Upload Paper
              </Button>
            </Stack>
          </Card>
        </Box>
      );
    }

    return (
      <Box>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 28 }}>Learn</Typography>
            <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
              Select a paper to view personalized recommendations
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ChatRoundedIcon />}
            onClick={() => router.push("/dashboard/chat")}
            sx={{ borderRadius: 2.5, fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Chat First
          </Button>
        </Stack>

        {/* Info Banner */}
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: "rgba(26,115,232,0.04)",
            border: "1px solid rgba(26,115,232,0.1)",
            borderRadius: 3,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "primary.main",
                display: "grid",
                placeItems: "center",
              }}
            >
              <SchoolRoundedIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                How it works
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                Chat with AI about a paper → Get personalized pre/post learning resources and external tutorials
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Search */}
        <Card
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 3,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search papers..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                maxWidth: 400,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.02)",
                },
              }}
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: "text.secondary", mr: 1, display: "flex" }}>
                    <SearchRoundedIcon sx={{ fontSize: 20 }} />
                  </Box>
                ),
              }}
            />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              {filteredPapers.length} paper{filteredPapers.length !== 1 ? "s" : ""}
            </Typography>
          </Stack>
        </Card>

        {/* Papers Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2.5,
          }}
        >
          {filteredPapers.map((paper) => (
            <motion.div
              key={paper.file_hash}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 8px 30px rgba(26,115,232,0.12)",
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => router.push(`/dashboard/learn?paper=${paper.file_hash}`)}
              >
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      bgcolor: "rgba(239,68,68,0.08)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <ArticleRoundedIcon sx={{ color: "error.main", fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: 15,
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.4,
                      }}
                    >
                      {paper.file_name?.replace(".pdf", "") || "Untitled Paper"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      Click to view recommendations
                    </Typography>
                  </Box>
                  <Chip
                    label={paper.status === "completed" ? "Ready" : "Analyzed"}
                    size="small"
                    sx={{
                      width: "fit-content",
                      height: 24,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: "rgba(34,197,94,0.08)",
                      color: "success.main",
                    }}
                  />
                </Stack>
              </Card>
            </motion.div>
          ))}
        </Box>

        {/* Empty search result */}
        {filteredPapers.length === 0 && searchQuery && (
          <Card
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              border: "1px dashed rgba(0,0,0,0.15)",
              borderRadius: 3,
            }}
          >
            <Typography sx={{ color: "text.secondary" }}>
              No papers found matching "{searchQuery}"
            </Typography>
          </Card>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.push("/dashboard/learn")}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 24 }}>Learning Resources</Typography>
          {selectedPaper && (
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              {selectedPaper.file_name?.replace(".pdf", "")}
            </Typography>
          )}
        </Box>
      </Stack>

      {loadingRecommendations ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2, color: "text.secondary" }}>
            Loading your personalized recommendations...
          </Typography>
        </Stack>
      ) : recommendationsError ? (
        <Card elevation={0} sx={{ p: 6, textAlign: "center", border: "1px solid rgba(239,68,68,0.2)", maxWidth: 500, mx: "auto" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: "rgba(239,68,68,0.08)",
              display: "grid",
              placeItems: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <ChatRoundedIcon sx={{ fontSize: 32, color: "error.main" }} />
          </Box>
          <Typography sx={{ color: "error.main", fontWeight: 700, fontSize: 18 }}>
            No Recommendations Yet
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 1, mb: 3, lineHeight: 1.7 }}>
            To get personalized recommendations, you need to:
          </Typography>
          <Stack spacing={1.5} sx={{ textAlign: "left", maxWidth: 300, mx: "auto", mb: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "primary.main", color: "white", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>1</Box>
              <Typography sx={{ fontSize: 14 }}>Start a chat about this paper</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "primary.main", color: "white", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>2</Box>
              <Typography sx={{ fontSize: 14 }}>Have a conversation (3+ messages)</Typography>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 24, height: 24, borderRadius: "50%", bgcolor: "primary.main", color: "white", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>3</Box>
              <Typography sx={{ fontSize: 14 }}>Click "Get Recommendations"</Typography>
            </Stack>
          </Stack>
          <Button
            variant="contained"
            startIcon={<ChatRoundedIcon />}
            onClick={() => router.push("/dashboard/chat")}
            sx={{ borderRadius: 2.5, fontWeight: 600 }}
          >
            Start Chat Session
          </Button>
        </Card>
      ) : (
        <Box>
          {/* Tabs */}
          <Card elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: 3, mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                px: 2,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  minHeight: 56,
                },
              }}
            >
              <Tab
                label={`Pre-Learning (${recommendations?.pre_learning?.length || 0})`}
                icon={<MenuBookRoundedIcon sx={{ fontSize: 20 }} />}
                iconPosition="start"
              />
              <Tab
                label={`Post-Learning (${recommendations?.post_learning?.length || 0})`}
                icon={<TrendingUpRoundedIcon sx={{ fontSize: 20 }} />}
                iconPosition="start"
              />
              <Tab
                label={`Resources (${recommendations?.external_resources?.length || 0})`}
                icon={<PlayCircleFilledRoundedIcon sx={{ fontSize: 20 }} />}
                iconPosition="start"
              />
            </Tabs>
          </Card>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="pre"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Typography sx={{ color: "text.secondary", mb: 2, fontSize: 14 }}>
                  Papers and resources to study first for better understanding.
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                    gap: 2,
                  }}
                >
                  {recommendations?.pre_learning?.map((resource, idx) => (
                    <ResourceCard
                      key={idx}
                      resource={resource}
                      onView={setViewingResource}
                    />
                  ))}
                </Box>
                {(!recommendations?.pre_learning || recommendations.pre_learning.length === 0) && (
                  <Card elevation={0} sx={{ p: 4, textAlign: "center", border: "1px dashed rgba(0,0,0,0.1)" }}>
                    <Typography sx={{ color: "text.secondary" }}>
                      No pre-learning resources found.
                    </Typography>
                  </Card>
                )}
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                key="post"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Typography sx={{ color: "text.secondary", mb: 2, fontSize: 14 }}>
                  Advanced papers that build upon or extend this work.
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                    gap: 2,
                  }}
                >
                  {recommendations?.post_learning?.map((resource, idx) => (
                    <ResourceCard
                      key={idx}
                      resource={resource}
                      onView={setViewingResource}
                    />
                  ))}
                </Box>
                {(!recommendations?.post_learning || recommendations.post_learning.length === 0) && (
                  <Card elevation={0} sx={{ p: 4, textAlign: "center", border: "1px dashed rgba(0,0,0,0.1)" }}>
                    <Typography sx={{ color: "text.secondary" }}>
                      No post-learning resources found.
                    </Typography>
                  </Card>
                )}
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="external"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Typography sx={{ color: "text.secondary", mb: 2, fontSize: 14 }}>
                  Tutorials, videos, and guides to help you learn related concepts.
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                    gap: 2,
                  }}
                >
                  {recommendations?.external_resources?.map((resource, idx) => (
                    <ResourceCard
                      key={idx}
                      resource={resource}
                      onView={setViewingResource}
                    />
                  ))}
                </Box>
                {(!recommendations?.external_resources || recommendations.external_resources.length === 0) && (
                  <Card elevation={0} sx={{ p: 4, textAlign: "center", border: "1px dashed rgba(0,0,0,0.1)" }}>
                    <Typography sx={{ color: "text.secondary" }}>
                      No external resources found.
                    </Typography>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      )}

      {/* Embedded Viewer */}
      <EmbeddedViewer
        resource={viewingResource}
        open={!!viewingResource}
        onClose={() => setViewingResource(null)}
      />
    </Box>
  );
}

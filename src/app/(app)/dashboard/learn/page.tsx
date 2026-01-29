"use client";

import { useState, useMemo, memo, useCallback } from "react";
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
  InputAdornment,
  Avatar,
  Tooltip,
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
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import { learningAPI, RecommendedResource } from "@/lib/api/learning";
import { usePapers } from "@/lib/contexts/AppDataContext";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import PaperCard from "@/components/ui/PaperCard";

// Resource type configurations with distinct colors and styles
const resourceTypeConfig: Record<string, { icon: any; color: string; gradient: string; label: string }> = {
  paper: {
    icon: ArticleRoundedIcon,
    color: "#1a73e8",
    gradient: "linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)",
    label: "Paper",
  },
  video: {
    icon: PlayCircleFilledRoundedIcon,
    color: "#ea580c",
    gradient: "linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)",
    label: "Video",
  },
  article: {
    icon: MenuBookRoundedIcon,
    color: "#0891b2",
    gradient: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
    label: "Article",
  },
  course: {
    icon: SchoolRoundedIcon,
    color: "#7c3aed",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    label: "Course",
  },
  tutorial: {
    icon: SchoolRoundedIcon,
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    label: "Tutorial",
  },
  blog: {
    icon: ArticleRoundedIcon,
    color: "#1a73e8",
    gradient: "linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)",
    label: "Blog",
  },
};

// Video resource card with thumbnail style
const VideoResourceCard = memo(function VideoResourceCard({
  resource,
  onView,
}: {
  resource: RecommendedResource;
  onView: () => void;
}) {
  const config = resourceTypeConfig.video;
  const relevancePercent = Math.round(resource.relevance_score * 100);

  // Extract YouTube thumbnail if possible
  const youtubeId = resource.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null;

  return (
    <Card
      elevation={0}
      onClick={onView}
      sx={{
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 3,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 40px rgba(234,88,12,0.15)",
          "& .play-btn": { transform: "scale(1.1)" },
        },
      }}
    >
      {/* Thumbnail area */}
      <Box
        sx={{
          height: 140,
          bgcolor: thumbnailUrl ? "transparent" : `${config.color}15`,
          backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Box
          className="play-btn"
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: config.gradient,
            display: "grid",
            placeItems: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            transition: "transform 0.2s ease",
          }}
        >
          <PlayCircleFilledRoundedIcon sx={{ color: "white", fontSize: 32 }} />
        </Box>

        {/* Duration badge */}
        {resource.duration && (
          <Chip
            icon={<AccessTimeRoundedIcon sx={{ fontSize: 14 }} />}
            label={resource.duration}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              bgcolor: "rgba(0,0,0,0.7)",
              color: "white",
              fontSize: 11,
              height: 24,
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5 }}>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: 15,
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {resource.title}
        </Typography>

        {resource.author && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
            <PersonRoundedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {resource.author}
            </Typography>
          </Stack>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip
            label={`${relevancePercent}% match`}
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: `${config.color}15`,
              color: config.color,
            }}
          />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              if (resource.url) window.open(resource.url, "_blank");
            }}
          >
            <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Box>
    </Card>
  );
});

// Paper resource card with citation style
const PaperResourceCard = memo(function PaperResourceCard({
  resource,
  onView,
}: {
  resource: RecommendedResource;
  onView: () => void;
}) {
  const config = resourceTypeConfig.paper;
  const relevancePercent = Math.round(resource.relevance_score * 100);

  return (
    <Card
      elevation={0}
      onClick={onView}
      sx={{
        p: 3,
        border: `2px solid ${config.color}20`,
        borderLeft: `4px solid ${config.color}`,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.2s ease",
        bgcolor: `${config.color}03`,
        "&:hover": {
          bgcolor: `${config.color}08`,
          transform: "translateX(4px)",
        },
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: 15,
          mb: 1.5,
          color: "#1a1a1a",
        }}
      >
        {resource.title}
      </Typography>

      {resource.author && (
        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1.5, fontStyle: "italic" }}>
          {resource.author}
        </Typography>
      )}

      <Typography
        sx={{
          fontSize: 13,
          color: "text.secondary",
          lineHeight: 1.6,
          mb: 2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
      >
        {resource.explanation}
      </Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<ArticleRoundedIcon sx={{ fontSize: 14 }} />}
            label="Paper"
            size="small"
            sx={{ height: 24, fontSize: 11, bgcolor: `${config.color}15`, color: config.color }}
          />
          <Chip
            label={`${relevancePercent}% match`}
            size="small"
            sx={{ height: 24, fontSize: 11, bgcolor: "rgba(0,0,0,0.06)" }}
          />
        </Stack>
        {resource.url && (
          <Button
            size="small"
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => {
              e.stopPropagation();
              window.open(resource.url, "_blank");
            }}
            sx={{ textTransform: "none", fontSize: 12 }}
          >
            View Paper
          </Button>
        )}
      </Stack>
    </Card>
  );
});

// Generic resource card for articles, tutorials, etc.
const GenericResourceCard = memo(function GenericResourceCard({
  resource,
  onView,
}: {
  resource: RecommendedResource;
  onView: () => void;
}) {
  const config = resourceTypeConfig[resource.resource_type] || resourceTypeConfig.article;
  const Icon = config.icon;
  const relevancePercent = Math.round(resource.relevance_score * 100);

  return (
    <Card
      elevation={0}
      onClick={onView}
      sx={{
        p: 2.5,
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 3,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: config.color,
          boxShadow: `0 8px 30px ${config.color}15`,
          transform: "translateY(-2px)",
          "& .icon-box": { transform: "scale(1.1)" },
        },
      }}
    >
      <Stack direction="row" spacing={2}>
        <Box
          className="icon-box"
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            background: config.gradient,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            transition: "transform 0.2s ease",
          }}
        >
          <Icon sx={{ color: "white", fontSize: 26 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Chip
              label={config.label}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 700,
                bgcolor: `${config.color}15`,
                color: config.color,
              }}
            />
            {resource.duration && (
              <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                {resource.duration}
              </Typography>
            )}
          </Stack>

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

          {resource.author && (
            <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 1 }}>
              by {resource.author}
            </Typography>
          )}

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {resource.explanation}
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
            <Box sx={{ width: 100 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.3 }}>
                <Typography sx={{ fontSize: 10, color: "text.secondary" }}>Relevance</Typography>
                <Typography sx={{ fontSize: 10, fontWeight: 600, color: config.color }}>
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
                  "& .MuiLinearProgress-bar": { bgcolor: config.color },
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
              >
                <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
});

// Resource card selector based on type
const ResourceCard = memo(function ResourceCard({
  resource,
  onView,
}: {
  resource: RecommendedResource;
  onView: (resource: RecommendedResource) => void;
}) {
  const handleView = useCallback(() => onView(resource), [onView, resource]);

  if (resource.resource_type === "video") {
    return <VideoResourceCard resource={resource} onView={handleView} />;
  }
  if (resource.resource_type === "paper") {
    return <PaperResourceCard resource={resource} onView={handleView} />;
  }
  return <GenericResourceCard resource={resource} onView={handleView} />;
});

// Embedded content viewer
const EmbeddedViewer = memo(function EmbeddedViewer({
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      fullScreen={typeof window !== "undefined" && window.innerWidth < 600}
    >
      <DialogContent sx={{ p: 0, height: { xs: "100vh", sm: "80vh" } }}>
        <Stack sx={{ height: "100%" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1}
            sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 18 } }} noWrap>{resource.title}</Typography>
              <Typography sx={{ color: "text.secondary", fontSize: { xs: 12, sm: 14 } }}>
                {resource.resource_type}
                {resource.author && ` • ${resource.author}`}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              {resource.url && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<OpenInNewRoundedIcon />}
                  onClick={() => window.open(resource.url, "_blank")}
                  sx={{ borderRadius: 2, fontSize: { xs: 12, sm: 14 } }}
                >
                  <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Open External</Box>
                  <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>Open</Box>
                </Button>
              )}
              <Button variant="contained" size="small" onClick={onClose} sx={{ borderRadius: 2 }}>
                Close
              </Button>
            </Stack>
          </Stack>

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
});

export default function LearnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperHash = searchParams.get("paper");

  const [activeTab, setActiveTab] = useState(0);
  const [viewingResource, setViewingResource] = useState<RecommendedResource | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { papers } = usePapers();
  const selectedPaper = useMemo(
    () => papers.find((p) => p.file_hash === paperHash),
    [papers, paperHash]
  );

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

  const filteredPapers = useMemo(() => {
    if (!searchQuery) return papers;
    return papers.filter((p) => p.file_name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [papers, searchQuery]);

  // No paper selected - show paper selector
  if (!paperHash) {
    if (papers.length === 0) {
      return (
        <Box sx={{ height: "calc(100vh - 140px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <EmptyState
            icon={SchoolRoundedIcon}
            title="No Papers Yet"
            description="Upload and chat about a paper to get personalized learning recommendations."
            action={{ label: "Start Chat", onClick: () => router.push("/dashboard/chat") }}
            secondaryAction={{ label: "Upload Paper", onClick: () => router.push("/dashboard/upload") }}
            variant="illustrated"
          />
        </Box>
      );
    }

    return (
      <Box>
        <PageHeader
          title="Learning Resources"
          subtitle="Select a paper to view personalized recommendations"
          action={
            <Button
              variant="outlined"
              startIcon={<ChatRoundedIcon />}
              onClick={() => router.push("/dashboard/chat")}
              sx={{ borderRadius: 2.5, fontWeight: 600 }}
            >
              Chat First
            </Button>
          }
        />

        {/* Info banner */}
        <Card
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            background: "linear-gradient(135deg, rgba(26,115,232,0.06) 0%, rgba(99,102,241,0.08) 100%)",
            border: "1px solid rgba(26,115,232,0.1)",
            borderRadius: 3,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main", width: 44, height: 44 }}>
              <SchoolRoundedIcon />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 14 }}>How it works</Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                Chat with AI about a paper → Get personalized pre/post learning resources and tutorials
              </Typography>
            </Box>
          </Stack>
        </Card>

        {/* Search */}
        <TextField
          placeholder="Search papers..."
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 3, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Papers grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2.5,
          }}
        >
          {filteredPapers.map((paper) => (
            <PaperCard
              key={paper.file_hash}
              fileHash={paper.file_hash}
              fileName={paper.file_name}
              hasAnalysis={paper.has_analysis}
              variant="detailed"
              onClick={() => router.push(`/dashboard/learn?paper=${paper.file_hash}`)}
            />
          ))}
        </Box>

        {filteredPapers.length === 0 && searchQuery && (
          <EmptyState
            icon={SearchRoundedIcon}
            title="No papers found"
            description={`No papers matching "${searchQuery}"`}
            variant="minimal"
          />
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
        <IconButton 
          onClick={() => router.push("/dashboard/learn")} 
          sx={{ bgcolor: "rgba(0,0,0,0.04)", flexShrink: 0 }}
          size="small"
        >
          <ArrowBackRoundedIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 18, sm: 24 } }}>Learning Resources</Typography>
          {selectedPaper && (
            <Typography 
              sx={{ 
                color: "text.secondary", 
                fontSize: { xs: 12, sm: 14 },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
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
        <EmptyState
          icon={ChatRoundedIcon}
          title="No Recommendations Yet"
          description="Chat about this paper first (3+ messages), then click 'Get Recommendations' to unlock personalized learning resources."
          action={{ label: "Start Chat Session", onClick: () => router.push("/dashboard/chat") }}
          variant="illustrated"
        />
      ) : (
        <Box>
          {/* Tabs */}
          <Card elevation={0} sx={{ border: "1px solid rgba(0,0,0,0.06)", borderRadius: 3, mb: 3, overflow: "hidden" }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                px: { xs: 0, sm: 2 },
                "& .MuiTab-root": { 
                  textTransform: "none", 
                  fontWeight: 600, 
                  minHeight: 56,
                  minWidth: { xs: "auto", sm: 160 },
                  px: { xs: 1.5, sm: 2 },
                  fontSize: { xs: 12, sm: 14 },
                },
                "& .MuiTabs-scrollButtons": {
                  "&.Mui-disabled": { opacity: 0.3 },
                },
              }}
            >
              <Tab
                label={<Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Pre-Learning ({recommendations?.pre_learning?.length || 0})</Box>}
                icon={<MenuBookRoundedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                iconPosition="start"
                aria-label={`Pre-Learning (${recommendations?.pre_learning?.length || 0})`}
              />
              <Tab
                label={<Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Post-Learning ({recommendations?.post_learning?.length || 0})</Box>}
                icon={<TrendingUpRoundedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                iconPosition="start"
                aria-label={`Post-Learning (${recommendations?.post_learning?.length || 0})`}
              />
              <Tab
                label={<Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>Resources ({recommendations?.external_resources?.length || 0})</Box>}
                icon={<PlayCircleFilledRoundedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                iconPosition="start"
                aria-label={`Resources (${recommendations?.external_resources?.length || 0})`}
              />
            </Tabs>
          </Card>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div key="pre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Typography sx={{ color: "text.secondary", mb: 2, fontSize: { xs: 13, sm: 14 }, px: { xs: 1, sm: 0 } }}>
                  Papers and resources to study first for better understanding.
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: { xs: 1.5, sm: 2 } }}>
                  {recommendations?.pre_learning?.map((resource, idx) => (
                    <ResourceCard key={idx} resource={resource} onView={setViewingResource} />
                  ))}
                </Box>
                {(!recommendations?.pre_learning || recommendations.pre_learning.length === 0) && (
                  <EmptyState
                    icon={MenuBookRoundedIcon}
                    title="No pre-learning resources"
                    description="No foundational resources found for this paper."
                    variant="minimal"
                  />
                )}
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Typography sx={{ color: "text.secondary", mb: 2, fontSize: { xs: 13, sm: 14 }, px: { xs: 1, sm: 0 } }}>
                  Advanced papers that build upon or extend this work.
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: { xs: 1.5, sm: 2 } }}>
                  {recommendations?.post_learning?.map((resource, idx) => (
                    <ResourceCard key={idx} resource={resource} onView={setViewingResource} />
                  ))}
                </Box>
                {(!recommendations?.post_learning || recommendations.post_learning.length === 0) && (
                  <EmptyState
                    icon={TrendingUpRoundedIcon}
                    title="No post-learning resources"
                    description="No advanced follow-up resources found."
                    variant="minimal"
                  />
                )}
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div key="external" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Typography sx={{ color: "text.secondary", mb: 2, fontSize: { xs: 13, sm: 14 }, px: { xs: 1, sm: 0 } }}>
                  Tutorials, videos, and guides to help you learn related concepts.
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: { xs: 1.5, sm: 2 } }}>
                  {recommendations?.external_resources?.map((resource, idx) => (
                    <ResourceCard key={idx} resource={resource} onView={setViewingResource} />
                  ))}
                </Box>
                {(!recommendations?.external_resources || recommendations.external_resources.length === 0) && (
                  <EmptyState
                    icon={PlayCircleFilledRoundedIcon}
                    title="No external resources"
                    description="No tutorials or videos found."
                    variant="minimal"
                  />
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

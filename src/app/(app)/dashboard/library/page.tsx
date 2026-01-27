"use client";

import { useState, useMemo, memo, useCallback } from "react";
import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Skeleton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { usePapers } from "@/lib/contexts/AppDataContext";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SortRoundedIcon from "@mui/icons-material/SortRounded";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import PaperCard from "@/components/ui/PaperCard";
import EmptyState from "@/components/ui/EmptyState";

type ViewMode = "grid" | "list";
type FilterStatus = "all" | "analyzed" | "pending";
type SortBy = "newest" | "oldest" | "name";

// Filter chip component
const FilterChip = memo(function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Chip
      label={`${label} (${count})`}
      onClick={onClick}
      sx={{
        fontWeight: 600,
        fontSize: 13,
        height: 36,
        px: 0.5,
        bgcolor: active ? "primary.main" : "rgba(0,0,0,0.04)",
        color: active ? "white" : "text.primary",
        "&:hover": {
          bgcolor: active ? "primary.dark" : "rgba(0,0,0,0.08)",
        },
      }}
    />
  );
});

// Stats bar component
const StatsBar = memo(function StatsBar({
  total,
  analyzed,
  pending,
}: {
  total: number;
  analyzed: number;
  pending: number;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        mb: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 3,
        background: "linear-gradient(135deg, rgba(26,115,232,0.02) 0%, rgba(99,102,241,0.04) 100%)",
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
        <Stack direction="row" spacing={4} sx={{ flex: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 28, color: "primary.main" }}>
              {total}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Total Papers</Typography>
          </Box>
          <Box sx={{ borderLeft: "1px solid rgba(0,0,0,0.08)", pl: 4 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 28, color: "#22c55e" }}>
              {analyzed}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Analyzed</Typography>
          </Box>
          <Box sx={{ borderLeft: "1px solid rgba(0,0,0,0.08)", pl: 4 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 28, color: "#f59e0b" }}>
              {pending}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Pending</Typography>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
});

export default function LibraryPage() {
  const router = useRouter();
  const { papers, isLoading, error } = usePapers();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  // Computed values
  const analyzedCount = useMemo(() => papers.filter((p) => p.has_analysis).length, [papers]);
  const pendingCount = useMemo(() => papers.filter((p) => !p.has_analysis).length, [papers]);

  // Filtered and sorted papers
  const filteredPapers = useMemo(() => {
    let result = [...papers];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((p) => p.file_name?.toLowerCase().includes(query));
    }

    // Filter by status
    if (filterStatus === "analyzed") {
      result = result.filter((p) => p.has_analysis);
    } else if (filterStatus === "pending") {
      result = result.filter((p) => !p.has_analysis);
    }

    // Sort
    if (sortBy === "name") {
      result.sort((a, b) => (a.file_name || "").localeCompare(b.file_name || ""));
    } else if (sortBy === "oldest") {
      result.reverse();
    }
    // 'newest' is default order from API

    return result;
  }, [papers, searchQuery, filterStatus, sortBy]);

  const handleViewModeChange = useCallback((_: any, newMode: ViewMode | null) => {
    if (newMode) setViewMode(newMode);
  }, []);

  return (
    <Box>
      {/* Header */}
      <PageHeader
        title="Library"
        subtitle="All your research papers organized in one place"
        badge={papers.length > 0 ? `${papers.length} papers` : undefined}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => router.push("/dashboard/upload")}
            sx={{
              borderRadius: 2.5,
              px: 2.5,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(26,115,232,0.25)",
            }}
          >
            Upload Paper
          </Button>
        }
      />

      {/* Stats Bar */}
      {papers.length > 0 && (
        <StatsBar total={papers.length} analyzed={analyzedCount} pending={pendingCount} />
      )}

      {/* Toolbar */}
      {papers.length > 0 && (
        <Card
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            {/* Search */}
            <TextField
              placeholder="Search papers..."
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: "100%", md: 280 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.02)",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" spacing={2} alignItems="center">
              {/* Filter chips */}
              <Stack direction="row" spacing={1}>
                <FilterChip
                  label="All"
                  count={papers.length}
                  active={filterStatus === "all"}
                  onClick={() => setFilterStatus("all")}
                />
                <FilterChip
                  label="Analyzed"
                  count={analyzedCount}
                  active={filterStatus === "analyzed"}
                  onClick={() => setFilterStatus("analyzed")}
                />
                <FilterChip
                  label="Pending"
                  count={pendingCount}
                  active={filterStatus === "pending"}
                  onClick={() => setFilterStatus("pending")}
                />
              </Stack>

              {/* Sort */}
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  displayEmpty
                  sx={{ borderRadius: 2, fontSize: 14 }}
                  startAdornment={
                    <SortRoundedIcon sx={{ fontSize: 18, color: "text.secondary", mr: 0.5 }} />
                  }
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                </Select>
              </FormControl>

              {/* View toggle */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    border: "1px solid rgba(0,0,0,0.1)",
                    px: 1.5,
                  },
                }}
              >
                <ToggleButton value="grid">
                  <GridViewRoundedIcon sx={{ fontSize: 20 }} />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListRoundedIcon sx={{ fontSize: 20 }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} elevation={0} sx={{ p: 2.5, border: "1px solid rgba(0,0,0,0.06)" }}>
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rounded" width={48} height={48} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="80%" height={20} sx={{ mb: 1 }} />
                  <Skeleton width="40%" height={16} />
                </Box>
              </Stack>
            </Card>
          ))}
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Card
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px solid rgba(239,68,68,0.2)",
            bgcolor: "rgba(239,68,68,0.04)",
            borderRadius: 3,
          }}
        >
          <Typography sx={{ color: "error.main", fontWeight: 600, mb: 1 }}>
            Failed to load library
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Please check your connection and try again.
          </Typography>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && papers.length === 0 && (
        <EmptyState
          icon={FolderOpenRoundedIcon}
          title="Your library is empty"
          description="Upload your first research paper to get AI-powered summaries, glossaries, and intelligent insights."
          action={{
            label: "Upload Your First Paper",
            icon: AddRoundedIcon,
            onClick: () => router.push("/dashboard/upload"),
          }}
          variant="illustrated"
        />
      )}

      {/* No results */}
      {!isLoading && papers.length > 0 && filteredPapers.length === 0 && (
        <Card
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px dashed rgba(0,0,0,0.15)",
            borderRadius: 3,
          }}
        >
          <SearchRoundedIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography sx={{ color: "text.secondary" }}>
            No papers found matching your criteria
          </Typography>
          <Button
            size="small"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("all");
            }}
            sx={{ mt: 1 }}
          >
            Clear filters
          </Button>
        </Card>
      )}

      {/* Papers Grid/List */}
      {!isLoading && filteredPapers.length > 0 && (
        <AnimatePresence mode="popLayout">
          <Box
            component={motion.div}
            layout
            sx={{
              display: "grid",
              gridTemplateColumns:
                viewMode === "grid"
                  ? { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }
                  : "1fr",
              gap: 2,
            }}
          >
            {filteredPapers.map((paper, idx) => (
              <motion.div
                key={paper.file_hash}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
              >
                <PaperCard
                  fileHash={paper.file_hash}
                  fileName={paper.file_name}
                  hasAnalysis={paper.has_analysis}
                  variant={viewMode === "grid" ? "detailed" : "list"}
                  showActions
                />
              </motion.div>
            ))}
          </Box>
        </AnimatePresence>
      )}

      {/* Results count */}
      {!isLoading && filteredPapers.length > 0 && (
        <Typography
          sx={{ mt: 3, textAlign: "center", color: "text.secondary", fontSize: 13 }}
        >
          Showing {filteredPapers.length} of {papers.length} papers
        </Typography>
      )}
    </Box>
  );
}

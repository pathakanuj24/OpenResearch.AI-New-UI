"use client";

import {
  Box,
  Button,
  Card,
  CircularProgress,
  Stack,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAnalyses } from "@/lib/hooks/useAnalyses";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";

export default function LibraryPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useAnalyses(20, 0);

  const papers = data?.analyses || [];

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 24, mb: 0.5 }}>
            Library
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 15 }}>
            All your analyzed research papers in one place.
          </Typography>
        </Box>

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
            boxShadow: "0 2px 8px rgba(26,115,232,0.25)",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(26,115,232,0.35)",
            },
          }}
        >
          Upload Paper
        </Button>
      </Stack>

      {/* Stats Bar */}
      {papers.length > 0 && (
        <Stack
          direction="row"
          spacing={3}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3,
            bgcolor: "white",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: "primary.main" }}>
              {papers.length}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              Total Papers
            </Typography>
          </Box>
          <Box sx={{ borderLeft: "1px solid rgba(0,0,0,0.08)", pl: 3 }}>
            <Typography sx={{ fontSize: 24, fontWeight: 700, color: "success.main" }}>
              {papers.filter((p) => p.has_analysis).length}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              Analyzed
            </Typography>
          </Box>
        </Stack>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <CircularProgress size={32} sx={{ mb: 2 }} />
          <Typography sx={{ color: "text.secondary" }}>
            Loading your papers...
          </Typography>
        </Card>
      )}

      {/* Error State */}
      {isError && (
        <Card
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px solid rgba(239,68,68,0.2)",
            bgcolor: "rgba(239,68,68,0.04)",
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
      {!isLoading && !isError && papers.length === 0 && (
        <Card
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px dashed rgba(0,0,0,0.15)",
            bgcolor: "rgba(0,0,0,0.01)",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: "rgba(26,115,232,0.08)",
              display: "grid",
              placeItems: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <FolderOpenRoundedIcon sx={{ fontSize: 32, color: "primary.main" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>
            No papers yet
          </Typography>
          <Typography sx={{ color: "text.secondary", mb: 3, maxWidth: 320, mx: "auto" }}>
            Upload your first research paper to get AI-powered summaries, glossaries, and insights.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => router.push("/dashboard/upload")}
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Upload Your First Paper
          </Button>
        </Card>
      )}

      {/* Papers Grid */}
      {!isLoading && papers.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {papers.map((p) => (
            <Card
              key={p.file_hash}
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: "0 4px 20px rgba(26,115,232,0.12)",
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => router.push(`/dashboard/library/${p.file_hash}`)}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: "rgba(239,68,68,0.08)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <DescriptionRoundedIcon sx={{ color: "error.main", fontSize: 22 }} />
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
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
                    {p.file_name?.replace(".pdf", "") || "Untitled Paper"}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    {p.has_analysis ? (
                      <Chip
                        label="Analyzed"
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: 11,
                          fontWeight: 600,
                          bgcolor: "rgba(34,197,94,0.1)",
                          color: "success.main",
                        }}
                      />
                    ) : (
                      <Chip
                        label="Pending"
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: 11,
                          fontWeight: 600,
                          bgcolor: "rgba(0,0,0,0.06)",
                          color: "text.secondary",
                        }}
                      />
                    )}
                  </Stack>
                </Box>

                <IconButton
                  size="small"
                  sx={{
                    color: "text.secondary",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    ".MuiCard-root:hover &": { opacity: 1 },
                  }}
                >
                  <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

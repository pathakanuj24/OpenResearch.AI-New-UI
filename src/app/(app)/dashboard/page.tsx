"use client";

import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useAnalyses } from "@/lib/hooks/useAnalyses";
import useCurrentUser from "@/lib/auth/useCurrentUser";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const quickActions = [
  {
    label: "Upload Paper",
    description: "Analyze a new research paper",
    icon: UploadFileRoundedIcon,
    href: "/dashboard/upload",
    color: "#1a73e8",
    bgColor: "rgba(26,115,232,0.08)",
  },
  {
    label: "Browse Library",
    description: "View all your papers",
    icon: LibraryBooksRoundedIcon,
    href: "/dashboard/library",
    color: "#7c3aed",
    bgColor: "rgba(124,58,237,0.08)",
  },
  {
    label: "AI Chat",
    description: "Ask questions about papers",
    icon: ChatRoundedIcon,
    href: "/dashboard/chat",
    color: "#059669",
    bgColor: "rgba(5,150,105,0.08)",
  },
];

export default function DashboardHome() {
  const router = useRouter();
  const user = useCurrentUser();
  const { data, isLoading } = useAnalyses(5, 0);

  const firstName = user?.displayName?.split(" ")[0] || "there";
  const recentPapers = data?.analyses?.slice(0, 3) || [];

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 28, mb: 0.5 }}>
          {getGreeting()}, {firstName}
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 16 }}>
          Here's what's happening with your research today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        <Card
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            background: "linear-gradient(135deg, rgba(26,115,232,0.04) 0%, rgba(66,133,244,0.08) 100%)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: "rgba(26,115,232,0.12)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <LibraryBooksRoundedIcon sx={{ color: "primary.main" }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 28, lineHeight: 1 }}>
                {isLoading ? "—" : data?.total || 0}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                Total Papers
              </Typography>
            </Box>
          </Stack>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            background: "linear-gradient(135deg, rgba(34,197,94,0.04) 0%, rgba(34,197,94,0.08) 100%)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: "rgba(34,197,94,0.12)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <TrendingUpRoundedIcon sx={{ color: "success.main" }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 28, lineHeight: 1 }}>
                {isLoading ? "—" : data?.analyses?.filter((a) => a.has_analysis).length || 0}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                Analyzed
              </Typography>
            </Box>
          </Stack>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: 3,
            border: "1px solid rgba(0,0,0,0.06)",
            background: "linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(124,58,237,0.08) 100%)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: "rgba(124,58,237,0.12)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ChatRoundedIcon sx={{ color: "#7c3aed" }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 28, lineHeight: 1 }}>
                0
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                Conversations
              </Typography>
            </Box>
          </Stack>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2 }}>
        Quick Actions
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.label}
              elevation={0}
              sx={{
                p: 2.5,
                border: "1px solid rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: action.color,
                  boxShadow: `0 4px 20px ${action.color}20`,
                  transform: "translateY(-2px)",
                },
              }}
              onClick={() => router.push(action.href)}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: action.bgColor,
                  display: "grid",
                  placeItems: "center",
                  mb: 2,
                }}
              >
                <Icon sx={{ color: action.color }} />
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: 15, mb: 0.5 }}>
                {action.label}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                {action.description}
              </Typography>
            </Card>
          );
        })}
      </Box>

      {/* Recent Papers */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
          Recent Papers
        </Typography>
        {recentPapers.length > 0 && (
          <Button
            size="small"
            endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => router.push("/dashboard/library")}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            View All
          </Button>
        )}
      </Stack>

      {isLoading && (
        <Card elevation={0} sx={{ p: 4, textAlign: "center", border: "1px solid rgba(0,0,0,0.06)" }}>
          <CircularProgress size={24} />
        </Card>
      )}

      {!isLoading && recentPapers.length === 0 && (
        <Card
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px dashed rgba(0,0,0,0.15)",
            bgcolor: "rgba(0,0,0,0.01)",
          }}
        >
          <Typography sx={{ color: "text.secondary", mb: 2 }}>
            No papers yet. Upload your first research paper to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadFileRoundedIcon />}
            onClick={() => router.push("/dashboard/upload")}
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 600 }}
          >
            Upload Paper
          </Button>
        </Card>
      )}

      {!isLoading && recentPapers.length > 0 && (
        <Stack spacing={1.5}>
          {recentPapers.map((paper) => (
            <Card
              key={paper.file_hash}
              elevation={0}
              sx={{
                p: 2,
                border: "1px solid rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "rgba(26,115,232,0.02)",
                },
              }}
              onClick={() => router.push(`/dashboard/library/${paper.file_hash}`)}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: "rgba(239,68,68,0.08)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <DescriptionRoundedIcon sx={{ color: "error.main", fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    sx={{ fontWeight: 600, fontSize: 14 }}
                    noWrap
                  >
                    {paper.file_name?.replace(".pdf", "") || "Untitled Paper"}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
                    {paper.has_analysis ? "Analysis complete" : "Pending analysis"}
                  </Typography>
                </Box>
                <ArrowForwardRoundedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              </Stack>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

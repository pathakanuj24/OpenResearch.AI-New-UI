"use client";

import { useMemo, memo } from "react";
import {
  Box,
  Button,
  Card,
  Stack,
  Typography,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import useCurrentUser from "@/lib/auth/useCurrentUser";
import { usePapers } from "@/lib/contexts/AppDataContext";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import { motion } from "framer-motion";
import StatCard from "@/components/ui/StatCard";
import PaperCard from "@/components/ui/PaperCard";
import EmptyState from "@/components/ui/EmptyState";

// Quick action card with unique styling
const QuickActionCard = memo(function QuickActionCard({
  label,
  description,
  icon: Icon,
  href,
  color,
  gradient,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  gradient: string;
}) {
  const router = useRouter();

  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <Card
        elevation={0}
        onClick={() => router.push(href)}
        sx={{
          p: 3,
          cursor: "pointer",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: color,
            boxShadow: `0 8px 30px ${color}20`,
            "& .icon-box": {
              transform: "scale(1.1) rotate(-5deg)",
            },
            "& .arrow": {
              opacity: 1,
              transform: "translateX(0)",
            },
          },
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: gradient,
            opacity: 0.1,
          }}
        />

        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Box
              className="icon-box"
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: gradient,
                display: "grid",
                placeItems: "center",
                mb: 2,
                transition: "transform 0.3s ease",
              }}
            >
              <Icon sx={{ color: "white", fontSize: 26 }} />
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5 }}>
              {label}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13, lineHeight: 1.5 }}>
              {description}
            </Typography>
          </Box>

          <IconButton
            className="arrow"
            size="small"
            sx={{
              opacity: 0,
              transform: "translateX(-8px)",
              transition: "all 0.2s ease",
              color,
            }}
          >
            <EastRoundedIcon />
          </IconButton>
        </Stack>
      </Card>
    </motion.div>
  );
});

export default function DashboardHome() {
  const router = useRouter();
  const user = useCurrentUser();
  const { papers, totalPapers, analyzedPapers, isLoading } = usePapers();

  const firstName = user?.displayName?.split(" ")[0] || "there";
  const recentPapers = useMemo(() => papers.slice(0, 4), [papers]);

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const quickActions = useMemo(
    () => [
      {
        label: "Upload Paper",
        description: "Analyze a new research paper with AI",
        icon: UploadFileRoundedIcon,
        href: "/dashboard/upload",
        color: "#1a73e8",
        gradient: "linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)",
      },
      {
        label: "AI Chat",
        description: "Ask questions and get insights",
        icon: ChatRoundedIcon,
        href: "/dashboard/chat",
        color: "#059669",
        gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      },
      {
        label: "Learning Path",
        description: "Get personalized recommendations",
        icon: SchoolRoundedIcon,
        href: "/dashboard/learn",
        color: "#7c3aed",
        gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
      },
      {
        label: "Knowledge Graph",
        description: "Visualize paper connections",
        icon: HubRoundedIcon,
        href: "/dashboard/graph",
        color: "#ea580c",
        gradient: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
      },
    ],
    []
  );

  return (
    <Box>
      {/* Welcome Section with Gradient */}
      <Card
        elevation={0}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 50%, #a855f7 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "100%",
            background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%)",
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <Avatar
                src={user?.photoURL || ""}
                sx={{
                  width: 48,
                  height: 48,
                  border: "2px solid rgba(255,255,255,0.3)",
                }}
              >
                {firstName[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 28 }}>
                  {greeting}, {firstName}!
                </Typography>
                <Typography sx={{ opacity: 0.9, fontSize: 15 }}>
                  Ready to dive into your research?
                </Typography>
              </Box>
            </Stack>
          </Box>

        </Stack>
      </Card>

      {/* Stats Row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          label="Total Papers"
          value={isLoading ? "—" : totalPapers}
          icon={LibraryBooksRoundedIcon}
          color="#1a73e8"
          variant="compact"
          isLoading={isLoading}
        />
        <StatCard
          label="Analyzed"
          value={isLoading ? "—" : analyzedPapers}
          icon={TrendingUpRoundedIcon}
          color="#22c55e"
          variant="compact"
          isLoading={isLoading}
        />
        <StatCard
          label="Conversations"
          value="—"
          icon={ChatRoundedIcon}
          color="#7c3aed"
          variant="compact"
        />
        <StatCard
          label="AI Insights"
          value="—"
          icon={AutoAwesomeRoundedIcon}
          color="#ea580c"
          variant="compact"
        />
      </Box>

      {/* Quick Actions */}
      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2 }}>
        Quick Actions
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
          mb: 4,
        }}
      >
        {quickActions.map((action) => (
          <QuickActionCard key={action.label} {...action} />
        ))}
      </Box>

      {/* Recent Papers */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Recent Papers</Typography>
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
        <Card elevation={0} sx={{ p: 4, border: "1px solid rgba(0,0,0,0.06)" }}>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Card>
      )}

      {!isLoading && recentPapers.length === 0 && (
        <EmptyState
          icon={DescriptionRoundedIcon}
          title="No papers yet"
          description="Upload your first research paper to get AI-powered summaries, chat capabilities, and learning recommendations."
          action={{
            label: "Upload Your First Paper",
            icon: UploadFileRoundedIcon,
            onClick: () => router.push("/dashboard/upload"),
          }}
          variant="illustrated"
        />
      )}

      {!isLoading && recentPapers.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          {recentPapers.map((paper) => (
            <PaperCard
              key={paper.file_hash}
              fileHash={paper.file_hash}
              fileName={paper.file_name}
              hasAnalysis={paper.has_analysis}
              variant="list"
              showActions
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

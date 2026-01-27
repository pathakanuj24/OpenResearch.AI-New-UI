"use client";

import { memo, useCallback } from "react";
import { Box, Card, Chip, IconButton, Stack, Typography, Tooltip } from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { useRouter } from "next/navigation";

interface PaperCardProps {
  fileHash: string;
  fileName: string;
  hasAnalysis: boolean;
  variant?: "default" | "compact" | "detailed" | "list";
  showActions?: boolean;
  onClick?: () => void;
}

function PaperCard({
  fileHash,
  fileName,
  hasAnalysis,
  variant = "default",
  showActions = false,
  onClick,
}: PaperCardProps) {
  const router = useRouter();
  const displayName = fileName?.replace(".pdf", "") || "Untitled Paper";

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/dashboard/library/${fileHash}`);
    }
  }, [onClick, router, fileHash]);

  const handleChat = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/dashboard/chat");
  }, [router]);

  const handleLearn = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/learn?paper=${fileHash}`);
  }, [router, fileHash]);

  if (variant === "list") {
    return (
      <Card
        elevation={0}
        onClick={handleClick}
        sx={{
          p: 2,
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 2,
          cursor: "pointer",
          transition: "all 0.15s ease",
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "rgba(26,115,232,0.02)",
            "& .actions": { opacity: 1 },
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "rgba(26,115,232,0.08)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <DescriptionRoundedIcon sx={{ color: "#1a73e8", fontSize: 20 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>
              {displayName}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
              {hasAnalysis ? "Analysis complete" : "Pending analysis"}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={0.5}
            className="actions"
            sx={{ opacity: 0, transition: "opacity 0.15s" }}
          >
            {showActions && (
              <>
                <Tooltip title="Chat">
                  <IconButton size="small" onClick={handleChat}>
                    <ChatRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Learn">
                  <IconButton size="small" onClick={handleLearn}>
                    <SchoolRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <ArrowForwardRoundedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
          </Stack>
        </Stack>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card
        elevation={0}
        onClick={handleClick}
        sx={{
          p: 2,
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 2.5,
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(26,115,232,0.1)",
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: "rgba(26,115,232,0.08)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <DescriptionRoundedIcon sx={{ color: "#1a73e8", fontSize: 18 }} />
          </Box>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 13,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName}
          </Typography>
        </Stack>
      </Card>
    );
  }

  if (variant === "detailed") {
    return (
      <Card
        elevation={0}
        onClick={handleClick}
        sx={{
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 3,
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "primary.main",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 30px rgba(26,115,232,0.12)",
            "& .cover": {
              transform: "scale(1.02)",
            },
          },
        }}
      >
        {/* Mini preview header */}
        <Box
          className="cover"
          sx={{
            height: 80,
            bgcolor: "rgba(26,115,232,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s ease",
            borderBottom: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <DescriptionRoundedIcon sx={{ color: "#1a73e8", fontSize: 32, opacity: 0.6 }} />
        </Box>

        <Box sx={{ p: 2.5 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 15,
              mb: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.4,
              minHeight: 42,
            }}
          >
            {displayName}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Chip
              label={hasAnalysis ? "Analyzed" : "Pending"}
              size="small"
              sx={{
                height: 24,
                fontSize: 11,
                fontWeight: 600,
                bgcolor: hasAnalysis ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.06)",
                color: hasAnalysis ? "#22c55e" : "text.secondary",
              }}
            />
            
            {showActions && (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Chat about this paper">
                  <IconButton size="small" onClick={handleChat} sx={{ color: "text.secondary" }}>
                    <ChatRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        </Box>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      elevation={0}
      onClick={handleClick}
      sx={{
        p: 2.5,
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 3,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 4px 20px rgba(26,115,232,0.12)",
          transform: "translateY(-2px)",
          "& .arrow": { opacity: 1, transform: "translateX(0)" },
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
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
          <DescriptionRoundedIcon sx={{ color: "#1a73e8", fontSize: 24 }} />
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
            {displayName}
          </Typography>

          <Chip
            label={hasAnalysis ? "Analyzed" : "Pending"}
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: hasAnalysis ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.06)",
              color: hasAnalysis ? "#22c55e" : "text.secondary",
            }}
          />
        </Box>

        <IconButton
          className="arrow"
          size="small"
          sx={{
            opacity: 0,
            transform: "translateX(-4px)",
            transition: "all 0.2s ease",
            color: "text.secondary",
          }}
        >
          <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>
    </Card>
  );
}

export default memo(PaperCard);

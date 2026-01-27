"use client";

import { memo } from "react";
import { Box, Card, Stack, Typography, Skeleton } from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor?: string;
  trend?: { value: number; label: string };
  variant?: "default" | "compact" | "glass" | "outline";
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
  variant = "default",
  isLoading,
}: StatCardProps) {
  const bg = bgColor || `${color}12`;

  if (variant === "glass") {
    return (
      <Card
        elevation={0}
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
          backdropFilter: "blur(10px)",
          border: `1px solid ${color}20`,
          borderRadius: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: "50%",
            bgcolor: `${color}10`,
          }}
        />
        <Stack spacing={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: `${color}15`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon sx={{ color, fontSize: 24 }} />
          </Box>
          <Box>
            {isLoading ? (
              <Skeleton width={60} height={36} />
            ) : (
              <Typography sx={{ fontWeight: 800, fontSize: 32, color, lineHeight: 1 }}>
                {value}
              </Typography>
            )}
            <Typography sx={{ color: "text.secondary", fontSize: 14, mt: 0.5 }}>
              {label}
            </Typography>
          </Box>
          {trend && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              {trend.value >= 0 ? (
                <TrendingUpRoundedIcon sx={{ fontSize: 16, color: "success.main" }} />
              ) : (
                <TrendingDownRoundedIcon sx={{ fontSize: 16, color: "error.main" }} />
              )}
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: trend.value >= 0 ? "success.main" : "error.main",
                }}
              >
                {Math.abs(trend.value)}% {trend.label}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <Card
        elevation={0}
        sx={{
          p: 2,
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 2.5,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: bg,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon sx={{ color, fontSize: 20 }} />
          </Box>
          <Box>
            {isLoading ? (
              <Skeleton width={40} height={24} />
            ) : (
              <Typography sx={{ fontWeight: 700, fontSize: 20, lineHeight: 1 }}>
                {value}
              </Typography>
            )}
            <Typography sx={{ color: "text.secondary", fontSize: 12 }}>
              {label}
            </Typography>
          </Box>
        </Stack>
      </Card>
    );
  }

  if (variant === "outline") {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `2px solid ${color}30`,
          bgcolor: `${color}05`,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: `${color}15`,
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 1.5,
          }}
        >
          <Icon sx={{ color }} />
        </Box>
        {isLoading ? (
          <Skeleton width={60} height={32} sx={{ mx: "auto" }} />
        ) : (
          <Typography sx={{ fontWeight: 800, fontSize: 28, color }}>{value}</Typography>
        )}
        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>{label}</Typography>
      </Box>
    );
  }

  // Default variant
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid rgba(0,0,0,0.06)",
        background: `linear-gradient(135deg, ${color}06 0%, ${color}12 100%)`,
        borderRadius: 3,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            bgcolor: `${color}18`,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon sx={{ color, fontSize: 26 }} />
        </Box>
        <Box>
          {isLoading ? (
            <Skeleton width={50} height={32} />
          ) : (
            <Typography sx={{ fontWeight: 800, fontSize: 28, lineHeight: 1 }}>
              {value}
            </Typography>
          )}
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

export default memo(StatCard);

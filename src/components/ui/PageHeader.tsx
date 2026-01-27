"use client";

import { Box, Stack, Typography, Button, Chip } from "@mui/material";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: ReactNode;
  breadcrumb?: string;
  variant?: "default" | "gradient" | "minimal";
}

export default function PageHeader({
  title,
  subtitle,
  badge,
  action,
  breadcrumb,
  variant = "default",
}: PageHeaderProps) {
  if (variant === "gradient") {
    return (
      <Box
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 50%, #a855f7 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "40%",
            height: "100%",
            background: "radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)",
          }}
        />
        
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box>
            {breadcrumb && (
              <Typography sx={{ fontSize: 13, opacity: 0.8, mb: 0.5 }}>
                {breadcrumb}
              </Typography>
            )}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography sx={{ fontWeight: 800, fontSize: 28 }}>{title}</Typography>
              {badge && (
                <Chip
                  label={badge}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
              )}
            </Stack>
            {subtitle && (
              <Typography sx={{ mt: 0.5, opacity: 0.9, fontSize: 15 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
      </Box>
    );
  }

  if (variant === "minimal") {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 24 }}>{title}</Typography>
        {action}
      </Stack>
    );
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 4 }}
    >
      <Box>
        {breadcrumb && (
          <Typography sx={{ color: "text.secondary", fontSize: 13, mb: 0.5 }}>
            {breadcrumb}
          </Typography>
        )}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography sx={{ fontWeight: 700, fontSize: 28 }}>{title}</Typography>
          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                bgcolor: "rgba(26,115,232,0.1)",
                color: "primary.main",
                fontWeight: 600,
                fontSize: 11,
              }}
            />
          )}
        </Stack>
        {subtitle && (
          <Typography sx={{ color: "text.secondary", mt: 0.5, fontSize: 15 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}

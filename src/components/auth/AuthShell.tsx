"use client";

import { ReactNode } from "react";
import { Box, Stack, Typography, Container, Paper } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

type AuthShellProps = {
  titleLeft: string;
  subtitleLeft: string;
  bullets?: string[];
  stats?: { label: string }[];
  children: ReactNode;

  brandName?: string;
  brandTextColor?: string;
};

export default function AuthShell({
  titleLeft,
  subtitleLeft,
  bullets = [],
  stats = [],
  children,
  brandName = "OpenResearch.AI",
  brandTextColor = "rgba(255,255,255,0.95)",
}: AuthShellProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "#0e0e0f",
      }}
    >
      {/* LEFT PANEL */}
      <Box
        sx={{
          flex: 1.15,
          display: { xs: "none", md: "flex" },
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg,#1976ff 0%, #6f2dbd 100%)",
        }}
      >
        {/* subtle grid */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.14) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            opacity: 0.14,
            pointerEvents: "none",
          }}
        />

        {/* glow */}
        <Box
          sx={{
            position: "absolute",
            width: 520,
            height: 520,
            right: -180,
            top: -220,
            background: "radial-gradient(circle, rgba(255,255,255,0.26), transparent 60%)",
            filter: "blur(10px)",
            opacity: 0.85,
            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            p: 6,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* BRAND ONLY (no icon / no box) */}
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: 22,
              color: brandTextColor,
              letterSpacing: "-0.01em",
              mb: 10,
            }}
          >
            {brandName}
          </Typography>

          {/* Headline */}
          <Box sx={{ mt: 6, maxWidth: 560 }}>
            <Typography
              sx={{
                fontSize: 46,
                fontWeight: 950,
                lineHeight: 1.05,
                mb: 2,
                color: "white",
                letterSpacing: "-0.03em",
              }}
            >
              {titleLeft}
            </Typography>

            <Typography
              sx={{
                fontSize: 18,
                opacity: 0.92,
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {subtitleLeft}
            </Typography>

            {/* Bullets */}
            {bullets.length > 0 && (
              <Stack spacing={2.2} sx={{ mt: 8 }}>
                {bullets.map((b) => (
                  <Stack key={b} direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "999px",
                        bgcolor: "rgba(255,255,255,0.18)",
                        border: "1px solid rgba(255,255,255,0.22)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "white" }} />
                    </Box>

                    <Typography sx={{ fontSize: 16, color: "rgba(255,255,255,0.95)" }}>
                      {b}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>

          {/* Stats */}
          {stats.length > 0 && (
            <Stack direction="row" spacing={2} sx={{ mt: "auto", pb: 2 }}>
              {stats.map((s) => (
                <Paper
                  key={s.label}
                  elevation={0}
                  sx={{
                    px: 2.2,
                    py: 1.6,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.20)",
                    color: "white",
                    minWidth: 170,
                  }}
                >
                  <Typography sx={{ fontWeight: 800 }}>{s.label}</Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      {/* RIGHT PANEL */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, md: 4 },
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center" }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}

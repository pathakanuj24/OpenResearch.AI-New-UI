"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function GradientHero({
  title,
  subtitle,
  primaryText,
  onPrimary,
  badges,
}: {
  title: string;
  subtitle: string;
  primaryText: string;
  onPrimary: () => void;
  badges: string[];
}) {
  return (
    <Box
      sx={{
        borderRadius: 5,
        p: { xs: 4, md: 6, lg: 8 },
        color: "white",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient Orbs */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -150,
          left: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,115,232,0.3) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      {/* Grid Pattern */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* Main Content */}
      <Stack spacing={3} sx={{ position: "relative", maxWidth: 640 }}>
        {/* Badge */}
        <Box>
          <Chip
            label="AI-Powered Research Assistant"
            sx={{
              bgcolor: "rgba(99,102,241,0.2)",
              color: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(99,102,241,0.3)",
              fontWeight: 600,
              fontSize: 12,
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: 32, sm: 40, md: 48, lg: 56 },
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </Typography>

        {/* Subtitle */}
        <Typography
          sx={{
            maxWidth: 520,
            opacity: 0.8,
            fontSize: { xs: 15, md: 17 },
            lineHeight: 1.7,
          }}
        >
          {subtitle}
        </Typography>

        {/* CTA */}
        <Box sx={{ pt: 1 }}>
          <Button
            onClick={onPrimary}
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              bgcolor: "white",
              color: "#0f172a",
              px: 3.5,
              py: 1.5,
              fontWeight: 700,
              fontSize: 15,
              borderRadius: 3,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {primaryText}
          </Button>
        </Box>

        {/* Feature Badges */}
        <Stack direction="row" spacing={1.5} sx={{ pt: 1, flexWrap: "wrap", gap: 1 }}>
          {badges.map((b) => (
            <Box
              key={b}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#22c55e",
                }}
              />
              {b}
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

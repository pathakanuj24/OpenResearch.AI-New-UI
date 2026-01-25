"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";

export default function GradientHero({
  title,
  subtitle,
  primaryText,
  secondaryText,
  onPrimary,
  onSecondary,
  badges,
}: {
  title: string;
  subtitle: string;
  primaryText: string;
  secondaryText: string;
  onPrimary: () => void;
  onSecondary: () => void;
  badges: string[];
}) {
  return (
    <Box
      sx={{
        borderRadius: 6,
        p: { xs: 4, md: 7 },
        color: "white",
        background: "linear-gradient(135deg,#1976ff 0%, #6f2dbd 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.18,
          pointerEvents: "none",
        }}
      />
      <Stack spacing={2} sx={{ position: "relative" }}>
        <Typography variant="h1" sx={{ fontSize: { xs: 38, md: 56 }, lineHeight: 1.05 }}>
          {title}
        </Typography>
        <Typography sx={{ maxWidth: 720, opacity: 0.9, fontSize: { xs: 15, md: 17 }, lineHeight: 1.7 }}>
          {subtitle}
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 1 }}>
          <Button
            onClick={onPrimary}
            variant="contained"
            sx={{
              bgcolor: "rgba(255,255,255,0.18)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.24)",
              backdropFilter: "blur(10px)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.24)" },
              px: 3,
              py: 1.3,
              fontWeight: 900,
            }}
          >
            {primaryText} →
          </Button>
          <Button
            onClick={onSecondary}
            variant="outlined"
            sx={{
              borderColor: "rgba(255,255,255,0.45)",
              color: "white",
              "&:hover": { borderColor: "rgba(255,255,255,0.7)" },
              px: 3,
              py: 1.3,
              fontWeight: 900,
            }}
          >
            {secondaryText}
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ pt: 1, flexWrap: "wrap" }}>
          {badges.map((b) => (
            <Chip
              key={b}
              label={b}
              sx={{
                bgcolor: "rgba(255,255,255,0.14)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

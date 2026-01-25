"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function CTA({
  title,
  subtitle,
  primaryText,
  secondaryText,
  onPrimary,
  onSecondary,
}: {
  title: string;
  subtitle: string;
  primaryText: string;
  secondaryText: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <Box
      sx={{
        p: { xs: 4, md: 6 },
        borderRadius: 5,
        background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
      />

      <Stack
        spacing={2}
        sx={{
          textAlign: "center",
          alignItems: "center",
          position: "relative",
          color: "white",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: 28, md: 40 },
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            maxWidth: 560,
            lineHeight: 1.7,
            opacity: 0.9,
            fontSize: { xs: 15, md: 17 },
          }}
        >
          {subtitle}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          <Button
            variant="contained"
            onClick={onPrimary}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              bgcolor: "white",
              color: "#1a73e8",
              px: 4,
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
          <Button
            variant="outlined"
            onClick={onSecondary}
            sx={{
              borderColor: "rgba(255,255,255,0.4)",
              color: "white",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: 15,
              borderRadius: 3,
              "&:hover": {
                borderColor: "rgba(255,255,255,0.7)",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            {secondaryText}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

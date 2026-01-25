"use client";

import { Box, Button, Paper, Stack, Typography } from "@mui/material";

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
    <Paper elevation={0} sx={{ p: { xs: 3.5, md: 5 }, borderRadius: 5 }}>
      <Stack spacing={1.2} sx={{ textAlign: "center", alignItems: "center" }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 36 } }}>
          {title}
        </Typography>
        <Typography sx={{ color: "text.secondary", maxWidth: 720, lineHeight: 1.7 }}>
          {subtitle}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
            <Button
              variant="contained"
              onClick={onPrimary}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
                px: 3,
                py: 1.3,
                fontWeight: 900,
              }}
            >
              {primaryText} →
            </Button>
            <Button
              variant="outlined"
              onClick={onSecondary}
              sx={{ px: 3, py: 1.3, fontWeight: 900 }}
            >
              {secondaryText}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}

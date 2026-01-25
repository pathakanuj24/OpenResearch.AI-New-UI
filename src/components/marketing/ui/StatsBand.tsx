"use client";

import { Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

export default function StatsBand({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: "white",
      }}
    >
      <Grid container spacing={2}>
        {items.map((s) => (
          <Grid key={s.label} item xs={12} sm={6} md={3}>
            <Stack spacing={0.5}>
              <Typography sx={{ fontSize: 26, fontWeight: 950, letterSpacing: "-0.02em" }}>
                {s.value}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
                {s.label}
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

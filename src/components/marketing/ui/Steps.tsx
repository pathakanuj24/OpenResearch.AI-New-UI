"use client";

import { Grid, Paper, Typography } from "@mui/material";

export default function Steps({
  items,
}: {
  items: { title: string; desc: string }[];
}) {
  return (
    <Grid container spacing={2.5}>
      {items.map((s, idx) => (
        <Grid key={s.title} item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: "100%" }}>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              Step {idx + 1}
            </Typography>
            <Typography sx={{ fontWeight: 950, fontSize: 17, mt: 0.6 }}>
              {s.title}
            </Typography>
            <Typography sx={{ mt: 1, color: "text.secondary", lineHeight: 1.7 }}>
              {s.desc}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

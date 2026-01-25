"use client";

import { Grid, Paper, Stack, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

export default function FeatureGrid({
  items,
}: {
  items: { title: string; desc: string }[];
}) {
  return (
    <Grid container spacing={2.5}>
      {items.map((f) => (
        <Grid key={f.title} item xs={12} md={6} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3.2,
              borderRadius: 4,
              height: "100%",
              transition: "transform 180ms ease, box-shadow 180ms ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 18px 45px rgba(16,24,40,0.10)",
              },
            }}
          >
            <Stack direction="row" spacing={1.6} alignItems="flex-start">
              <Paper
                elevation={0}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(26,115,232,0.10)",
                  border: "1px solid rgba(26,115,232,0.18)",
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ color: "primary.main" }} />
              </Paper>

              <Stack spacing={0.7}>
                <Typography sx={{ fontWeight: 950, fontSize: 17, letterSpacing: "-0.01em" }}>
                  {f.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {f.desc}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

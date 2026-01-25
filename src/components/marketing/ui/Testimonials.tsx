"use client";

import { Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

export default function Testimonials({
  items,
}: {
  items: { quote: string; name: string; role: string }[];
}) {
  return (
    <Grid container spacing={2.5}>
      {items.map((t) => (
        <Grid key={t.name} item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid rgba(0,0,0,0.06)",
              bgcolor: "white",
              height: "100%",
            }}
          >
            <Typography sx={{ fontWeight: 900, lineHeight: 1.8 }}>
              “{t.quote}”
            </Typography>
            <Stack sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 950 }}>{t.name}</Typography>
              <Typography sx={{ color: "text.secondary" }}>{t.role}</Typography>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

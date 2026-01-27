"use client";

import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";

export default function Testimonials({
  items,
}: {
  items: { quote: string; name: string; role: string }[];
}) {
  const colors = ["#1a73e8", "#22c55e", "#a855f7"];

  return (
    <Grid container spacing={3}>
      {items.map((t, idx) => (
        <Grid key={t.name} size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 4,
              border: "1px solid rgba(0,0,0,0.06)",
              bgcolor: "white",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "rgba(26,115,232,0.2)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
              },
            }}
          >
            <FormatQuoteRoundedIcon
              sx={{
                fontSize: 32,
                color: colors[idx % colors.length],
                opacity: 0.3,
                mb: 1,
              }}
            />

            <Typography
              sx={{
                fontSize: 16,
                lineHeight: 1.8,
                color: "text.primary",
                flex: 1,
                mb: 3,
              }}
            >
              "{t.quote}"
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: colors[idx % colors.length],
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                {t.name[0]}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                  {t.name}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                  {t.role}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

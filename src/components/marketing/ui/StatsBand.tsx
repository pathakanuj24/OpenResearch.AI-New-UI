"use client";

import { Box, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

const icons = [BoltRoundedIcon, DashboardRoundedIcon, CloudUploadRoundedIcon, LockRoundedIcon];
const colors = ["#1a73e8", "#22c55e", "#a855f7", "#f97316"];

export default function StatsBand({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <Box
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: "white",
      }}
    >
      <Grid container spacing={3}>
        {items.map((s, idx) => {
          const Icon = icons[idx % icons.length];
          const color = colors[idx % colors.length];

          return (
            <Grid key={s.label} size={{ xs: 6, md: 3 }}>
              <Stack spacing={1.5} alignItems={{ xs: "center", md: "flex-start" }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: `${color}12`,
                  }}
                >
                  <Icon sx={{ color, fontSize: 22 }} />
                </Box>
                <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                  <Typography
                    sx={{
                      fontSize: { xs: 24, md: 32 },
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                      mb: 0.5,
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: 14, fontWeight: 500 }}>
                    {s.label}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

const stepIcons = [CloudUploadRoundedIcon, AutoAwesomeRoundedIcon, SchoolRoundedIcon];

export default function Steps({
  items,
}: {
  items: { title: string; desc: string }[];
}) {
  return (
    <Grid container spacing={3}>
      {items.map((s, idx) => {
        const Icon = stepIcons[idx % stepIcons.length];

        return (
          <Grid key={s.title} size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 4,
                height: "100%",
                border: "1px solid rgba(0,0,0,0.06)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Step Number */}
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  right: -10,
                  fontSize: 120,
                  fontWeight: 900,
                  color: "rgba(0,0,0,0.03)",
                  lineHeight: 1,
                  pointerEvents: "none",
                }}
              >
                {idx + 1}
              </Box>

              <Stack spacing={2} sx={{ position: "relative" }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "primary.main",
                      color: "white",
                    }}
                  >
                    <Icon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: "rgba(26,115,232,0.1)",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "primary.main",
                    }}
                  >
                    {idx + 1}
                  </Box>
                </Stack>

                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>
                    {s.title}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                    {s.desc}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}

"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";

const icons = [
  ArticleRoundedIcon,
  ChatRoundedIcon,
  MenuBookRoundedIcon,
  AccountTreeRoundedIcon,
  SchoolRoundedIcon,
  FolderRoundedIcon,
];

const colors = [
  { bg: "rgba(26,115,232,0.08)", border: "rgba(26,115,232,0.15)", icon: "#1a73e8" },
  { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)", icon: "#22c55e" },
  { bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.15)", icon: "#a855f7" },
  { bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.15)", icon: "#f97316" },
  { bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.15)", icon: "#ec4899" },
  { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.15)", icon: "#6366f1" },
];

export default function FeatureGrid({
  items,
}: {
  items: { title: string; desc: string }[];
}) {
  return (
    <Grid container spacing={3}>
      {items.map((f, idx) => {
        const Icon = icons[idx % icons.length];
        const color = colors[idx % colors.length];

        return (
          <Grid key={f.title} size={{ xs: 12, md: 6, lg: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                height: "100%",
                border: "1px solid rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: color.border,
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: color.bg,
                  border: `1px solid ${color.border}`,
                  mb: 2,
                }}
              >
                <Icon sx={{ color: color.icon, fontSize: 24 }} />
              </Box>

              <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 1 }}>
                {f.title}
              </Typography>
              <Typography sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: 15 }}>
                {f.desc}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}

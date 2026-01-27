"use client";

import { Box, Paper, Stack, Typography, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";

const features = [
  {
    icon: ArticleRoundedIcon,
    title: "Summary",
    desc: "Key contributions, methods, results, limitations — instantly.",
    color: "#1a73e8",
  },
  {
    icon: MenuBookRoundedIcon,
    title: "Glossary",
    desc: "Terms explained using your paper context, not generic web text.",
    color: "#22c55e",
  },
  {
    icon: ChatRoundedIcon,
    title: "Chat with Paper",
    desc: "Ask questions and get grounded answers with references.",
    color: "#a855f7",
  },
  {
    icon: AccountTreeRoundedIcon,
    title: "Related Work",
    desc: "Discover prerequisite + follow-up papers from citations.",
    color: "#f97316",
  },
];

const checkItems = [
  "Structured Summary",
  "Glossary in context",
  "Related work from references",
  "Learning path + resources",
];

export default function ProductPreview() {
  return (
    <Box
      sx={{
        borderRadius: 5,
        p: { xs: 3, md: 5 },
        background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Grid container spacing={4} alignItems="center">
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            <Chip
              label="Product Preview"
              size="small"
              sx={{
                width: "fit-content",
                bgcolor: "rgba(26,115,232,0.08)",
                color: "primary.main",
                fontWeight: 600,
              }}
            />

            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 28, md: 36 },
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Your paper becomes a workspace
            </Typography>

            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, fontSize: 16 }}>
              Instead of scrolling PDFs, OpenResearch.AI gives you summary, glossary, citations,
              related work, and a chat that answers based on your paper.
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {checkItems.map((item) => (
                <Stack key={item} direction="row" spacing={1.5} alignItems="center">
                  <CheckCircleRoundedIcon sx={{ color: "#22c55e", fontSize: 20 }} />
                  <Typography sx={{ fontWeight: 500, color: "text.secondary" }}>
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2}>
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Grid key={f.title} size={{ xs: 12, sm: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 4,
                      border: "1px solid rgba(0,0,0,0.06)",
                      bgcolor: "white",
                      height: "100%",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: `${f.color}30`,
                        boxShadow: `0 8px 30px ${f.color}10`,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: `${f.color}12`,
                        mb: 2,
                      }}
                    >
                      <Icon sx={{ color: f.color, fontSize: 20 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5 }}>
                      {f.title}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.6 }}>
                      {f.desc}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

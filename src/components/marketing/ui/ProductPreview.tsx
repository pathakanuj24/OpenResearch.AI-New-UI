"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

function MiniCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.06)",
        bgcolor: "white",
      }}
    >
      <Typography sx={{ fontWeight: 950 }}>{title}</Typography>
      <Typography sx={{ color: "text.secondary", mt: 0.7, lineHeight: 1.7 }}>
        {desc}
      </Typography>
    </Paper>
  );
}

export default function ProductPreview() {
  return (
    <Box
      sx={{
        borderRadius: 6,
        p: { xs: 2.5, md: 4 },
        background: "linear-gradient(180deg, rgba(26,115,232,0.06), rgba(255,255,255,1))",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} md={5}>
          <Stack spacing={1.3}>
            <Typography sx={{ fontWeight: 950, fontSize: { xs: 24, md: 34 }, letterSpacing: "-0.03em" }}>
              Your paper becomes a workspace
            </Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.8 }}>
              Instead of scrolling PDFs, OpenResearch.AI gives you summary, glossary, citations, related work,
              and a chat that answers based on your paper.
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {["Structured Summary", "Glossary in context", "Related work from references", "Learning path + resources"].map((x) => (
                <Typography key={x} sx={{ fontWeight: 800, color: "text.secondary" }}>
                  ✓ {x}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MiniCard title="Summary" desc="Key contributions, methods, results, limitations — instantly." />
            </Grid>
            <Grid item xs={12} md={6}>
              <MiniCard title="Glossary" desc="Terms explained using your paper context, not generic web text." />
            </Grid>
            <Grid item xs={12} md={6}>
              <MiniCard title="Chat with Paper" desc="Ask questions and get grounded answers with references." />
            </Grid>
            <Grid item xs={12} md={6}>
              <MiniCard title="Related Work" desc="Discover prerequisite + follow-up papers from citations." />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

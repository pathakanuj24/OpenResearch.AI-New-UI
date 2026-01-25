"use client";

import { Paper, Stack, Typography } from "@mui/material";
import MarketingLayout from "../MarketingLayout";
import Section from "../ui/Section";
import { marketing } from "@/data/marketing";

export default function AboutPage() {
  return (
    <MarketingLayout>
      <Section>
        <Paper elevation={0} sx={{ p: { xs: 3.5, md: 5 }, borderRadius: 5 }}>
          <Stack spacing={1.2}>
            <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 38 } }}>
              {marketing.about.title}
            </Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 900 }}>
              {marketing.about.desc}
            </Typography>
            <Typography sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 900 }}>
              We built this because reading research shouldn’t feel like fighting formatting, jargon, and scattered tabs.
              Our goal is to give you a workspace that’s quick to scan, easy to trust, and simple to learn from.
            </Typography>
          </Stack>
        </Paper>
      </Section>
    </MarketingLayout>
  );
}

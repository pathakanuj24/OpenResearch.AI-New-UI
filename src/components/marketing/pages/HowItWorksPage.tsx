"use client";

import { Stack, Typography } from "@mui/material";
import MarketingLayout from "../MarketingLayout";
import Section from "../ui/Section";
import Steps from "../ui/Steps";
import { marketing } from "@/data/marketing";

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      <Section>
        <Stack spacing={1.2} sx={{ mb: 3 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 38 } }}>
            How it works
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 860 }}>
            A clean pipeline that turns a PDF into structured insight and learning direction.
          </Typography>
        </Stack>
        <Steps items={marketing.steps} />
      </Section>
    </MarketingLayout>
  );
}

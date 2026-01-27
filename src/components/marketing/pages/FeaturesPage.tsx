"use client";

import { Stack, Typography } from "@mui/material";
import MarketingLayout from "../MarketingLayout";
import Section from "../ui/Section";
import FeatureGrid from "../ui/FeatureGrid";
import { marketing } from "@/data/marketing";

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <Section>
        <Stack spacing={1.2} sx={{ mb: 3 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 38 } }}>
            Features
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 860 }}>
            A focused set of tools to extract signal from research papers — fast.
          </Typography>
        </Stack>
        <FeatureGrid items={marketing.features} />
      </Section>
    </MarketingLayout>
  );
}

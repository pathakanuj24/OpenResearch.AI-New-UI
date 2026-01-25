"use client";

import { Typography, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import MarketingLayout from "../MarketingLayout";
import Section from "../ui/Section";
import GradientHero from "../ui/GradientHero";
import FeatureGrid from "../ui/FeatureGrid";
import Steps from "../ui/Steps";
import FAQ from "../ui/FAQ";
import CTA from "../ui/CTA";
import SocialProof from "../ui/SocialProof";
import StatsBand from "../ui/StatsBand";
import ProductPreview from "../ui/ProductPreview";
import Testimonials from "../ui/Testimonials";
import { marketing } from "@/data/marketing";
import { routes } from "@/lib/routes";

export default function HomePage() {
  const router = useRouter();

  return (
    <MarketingLayout>
      <Section sx={{ pt: { xs: 4, md: 6 } }}>
        <GradientHero
          title={marketing.hero.title}
          subtitle={marketing.hero.subtitle}
          primaryText="Sign up free"
          secondaryText="Sign in"
          onPrimary={() => router.push(routes.signup)}
          onSecondary={() => router.push(routes.login)}
          badges={marketing.hero.badges}
        />

        <SocialProof items={["IIT Labs", "Research Clubs", "Masters Students", "AI Teams", "PhD Scholars"]} />
      </Section>

      <Section>
        <StatsBand
          items={[
            { value: "30s", label: "Typical analysis time" },
            { value: "1 workspace", label: "Summary + chat + related" },
            { value: "20MB", label: "PDF supported" },
            { value: "Private", label: "Your papers stay yours" },
          ]}
        />
      </Section>

      <Section>
        <ProductPreview />
      </Section>

      <Section>
        <Stack spacing={1.2} sx={{ mb: 3 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 950 }}>
            What you can do
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 820 }}>
            Everything you need to go from “PDF” → “understanding” in a single clean workspace.
          </Typography>
        </Stack>
        <FeatureGrid items={marketing.features} />
      </Section>

      <Section>
        <Stack spacing={1.2} sx={{ mb: 3 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 950 }}>
            How it works
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 820 }}>
            A simple workflow designed for speed and clarity.
          </Typography>
        </Stack>
        <Steps items={marketing.steps} />
      </Section>

      <Section>
        <Stack spacing={1.2} sx={{ mb: 3 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 950 }}>
            What users say
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 820 }}>
            Built for research speed — without losing paper context.
          </Typography>
        </Stack>

        <Testimonials
          items={[
            { quote: "The glossary + summary saved me hours before my exam.", name: "Aman", role: "Masters Student" },
            { quote: "Chat with paper is the best part — it stays grounded.", name: "Riya", role: "Research Intern" },
            { quote: "Related work suggestions helped me plan what to read next.", name: "Kabir", role: "PhD Scholar" },
          ]}
        />
      </Section>


      <Section>
        <Stack spacing={1.2} sx={{ mb: 3 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 28, md: 40 }, fontWeight: 950 }}>
            FAQ
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 820 }}>
            Quick answers to common questions.
          </Typography>
        </Stack>
        <FAQ items={marketing.faq} />
      </Section>

      <Section>
        <CTA
          title="Start learning faster today"
          subtitle="Create an account, upload your first paper, and get instant structured understanding."
          primaryText="Sign up free"
          secondaryText="View Features"
          onPrimary={() => router.push(routes.signup)}
          onSecondary={() => router.push(routes.features)}
        />
      </Section>
    </MarketingLayout>
  );
}

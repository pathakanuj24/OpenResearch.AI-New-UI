"use client";

import { Box, Chip, Typography, Stack } from "@mui/material";
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
      {/* Hero Section */}
      <Section sx={{ pt: { xs: 4, md: 6 } }}>
        <GradientHero
          title={marketing.hero.title}
          subtitle={marketing.hero.subtitle}
          primaryText="Get Started Free"
          secondaryText="Watch Demo"
          onPrimary={() => router.push(routes.signup)}
          onSecondary={() => router.push(routes.login)}
          badges={marketing.hero.badges}
        />

        <SocialProof items={["Research Clubs", "Masters Students", "AI Teams", "PhD Scholars"]} />
      </Section>

      {/* Stats Section */}
      <Section>
        <StatsBand
          items={[
            { value: "30s", label: "Typical analysis time" },
            { value: "All-in-one", label: "Summary + chat + related" },
            { value: "20MB", label: "PDF supported" },
            { value: "Private", label: "Your papers stay yours" },
          ]}
        />
      </Section>

      {/* Product Preview */}
      <Section>
        <ProductPreview />
      </Section>

      {/* Features Section */}
      <Section>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Chip
            label="Features"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(26,115,232,0.08)",
              color: "primary.main",
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 40 },
              fontWeight: 800,
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}
          >
            Everything you need to understand research
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.7,
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: 15, md: 17 },
            }}
          >
            From PDF to understanding in a single clean workspace. No more struggling with dense papers.
          </Typography>
        </Box>
        <FeatureGrid items={marketing.features} />
      </Section>

      {/* How it Works Section */}
      <Section>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Chip
            label="How it works"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(34,197,94,0.08)",
              color: "#22c55e",
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 40 },
              fontWeight: 800,
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}
          >
            Three simple steps to clarity
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.7,
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: 15, md: 17 },
            }}
          >
            A simple workflow designed for speed and clarity.
          </Typography>
        </Box>
        <Steps items={marketing.steps} />
      </Section>

      {/* Testimonials Section */}
      <Section>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Chip
            label="Testimonials"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(168,85,247,0.08)",
              color: "#a855f7",
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 40 },
              fontWeight: 800,
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}
          >
            Loved by researchers
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.7,
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: 15, md: 17 },
            }}
          >
            Built for research speed — without losing paper context.
          </Typography>
        </Box>

        <Testimonials
          items={[
            { quote: "The glossary + summary saved me hours before my exam. I finally understood the paper without reading it 5 times.", name: "Anuj", role: "AI Engineer" },
            { quote: "Chat with paper is the best part it stays grounded and doesn't hallucinate like other tools.", name: "Madhur", role: "Research Intern" },
            { quote: "Related work suggestions helped me plan what to read next. Saved me days of literature review.", name: "Jaskirat", role: "PhD Scholar" },
          ]}
        />
      </Section>

      {/* FAQ Section */}
      <Section>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Chip
            label="FAQ"
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(249,115,22,0.08)",
              color: "#f97316",
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: 28, md: 40 },
              fontWeight: 800,
              letterSpacing: "-0.02em",
              mb: 1.5,
            }}
          >
            Frequently asked questions
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.7,
              maxWidth: 600,
              mx: "auto",
              fontSize: { xs: 15, md: 17 },
            }}
          >
            Quick answers to common questions.
          </Typography>
        </Box>
        <Box sx={{ maxWidth: 720, mx: "auto" }}>
          <FAQ items={marketing.faq} />
        </Box>
      </Section>

      {/* CTA Section */}
      <Section sx={{ pb: { xs: 6, md: 8 } }}>
        <CTA
          title="Start learning faster today"
          subtitle="Create an account, upload your first paper, and get instant structured understanding. Free to start, no credit card required."
          primaryText="Get Started Free"
          secondaryText="View Features"
          onPrimary={() => router.push(routes.signup)}
          onSecondary={() => router.push(routes.features)}
        />
      </Section>
    </MarketingLayout>
  );
}

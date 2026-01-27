"use client";

import { Box, Card, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import MarketingLayout from "../MarketingLayout";

const features = [
  {
    icon: PsychologyRoundedIcon,
    title: "AI-Powered Analysis",
    description: "Get instant summaries, key findings, and technical glossaries from any research paper.",
    color: "#1a73e8",
  },
  {
    icon: AutoAwesomeRoundedIcon,
    title: "Interactive Chat",
    description: "Ask questions about papers and get intelligent, contextual answers in real-time.",
    color: "#22c55e",
  },
  {
    icon: SchoolRoundedIcon,
    title: "Learning Paths",
    description: "Receive personalized recommendations for prerequisite and follow-up readings.",
    color: "#7c3aed",
  },
  {
    icon: HubRoundedIcon,
    title: "Knowledge Graphs",
    description: "Visualize connections between papers, concepts, and citations.",
    color: "#ea580c",
  },
];

const values = [
  {
    icon: LightbulbRoundedIcon,
    title: "Innovation",
    color: "#f59e0b",
  },
  {
    icon: VerifiedRoundedIcon,
    title: "Integrity",
    color: "#22c55e",
  },
  {
    icon: SpeedRoundedIcon,
    title: "Efficiency",
    color: "#1a73e8",
  },
  {
    icon: RocketLaunchRoundedIcon,
    title: "Impact",
    color: "#7c3aed",
  },
];

export default function AboutPage() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          background: "linear-gradient(180deg, rgba(26,115,232,0.04) 0%, transparent 100%)",
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={2} sx={{ textAlign: "center", alignItems: "center" }}>
            <Chip
              label="About Us"
              sx={{
                bgcolor: "rgba(26,115,232,0.1)",
                color: "primary.main",
                fontWeight: 600,
                px: 1,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 32, md: 44 },
                fontWeight: 800,
                lineHeight: 1.2,
                background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Transforming How You Read Research
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: { xs: 16, md: 18 },
                lineHeight: 1.7,
                maxWidth: 600,
                textAlign: "center",
              }}
            >
              OpenResearch.AI is an intelligent research assistant that helps you understand 
              complex academic papers faster. We're on a mission to make scientific knowledge 
              accessible to everyone.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* What We Do */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: 24, md: 32 },
              textAlign: "center",
              mb: 5,
            }}
          >
            What We Do
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 3,
            }}
          >
            {features.map((feature) => (
              <Card
                key={feature.title}
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: "center",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 3,
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 12px 24px ${feature.color}15`,
                    borderColor: feature.color,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: `${feature.color}12`,
                    display: "grid",
                    placeItems: "center",
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <feature.icon sx={{ color: feature.color, fontSize: 28 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Our Story */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "rgba(0,0,0,0.02)" }}>
        <Container maxWidth="md">
          <Stack spacing={4} sx={{ textAlign: "center" }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 24, md: 32 } }}>
              Our Story
            </Typography>
            <Stack spacing={3}>
              <Typography sx={{ color: "text.secondary", fontSize: 17, lineHeight: 1.85 }}>
                OpenResearch.AI was born from a simple frustration: reading academic papers is hard. 
                As researchers ourselves, we spent countless hours deciphering dense jargon and 
                hunting for key findings buried in lengthy documents.
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 17, lineHeight: 1.85 }}>
                We knew there had to be a better way. With advances in AI and natural language 
                processing, we built a tool that helps researchers work smarter—one that respects 
                your time and helps you focus on what matters: understanding and applying knowledge.
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Values - Compact */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: 24, md: 32 },
              textAlign: "center",
              mb: 4,
            }}
          >
            Our Values
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            {values.map((value) => (
              <Paper
                key={value.title}
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 3,
                  py: 2,
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,0.06)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: value.color,
                    bgcolor: `${value.color}05`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: `${value.color}12`,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <value.icon sx={{ color: value.color, fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                  {value.title}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* CTA */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 5 },
              borderRadius: 4,
              textAlign: "center",
              background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 100%)",
              color: "white",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 22, md: 26 }, mb: 1.5 }}>
              Ready to transform your research?
            </Typography>
            <Typography sx={{ opacity: 0.9, mb: 3 }}>
              Join thousands of researchers using OpenResearch.AI
            </Typography>
            <Box
              component="a"
              href="/signup"
              sx={{
                display: "inline-block",
                px: 4,
                py: 1.5,
                bgcolor: "white",
                color: "#1a73e8",
                borderRadius: 3,
                fontWeight: 700,
                textDecoration: "none",
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              Get Started Free
            </Box>
          </Paper>
        </Container>
      </Box>
    </MarketingLayout>
  );
}

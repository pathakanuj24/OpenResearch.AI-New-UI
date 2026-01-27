"use client";

import { Box, Button, Card, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import FeedbackRoundedIcon from "@mui/icons-material/FeedbackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import MarketingLayout from "../MarketingLayout";

export default function ContactPage() {
  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe0tX_i80Uak_aj4ceeQLMu9QANHeTcFjjn8tZXEz1yDaVsWg/viewform";

  return (
    <MarketingLayout>
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="sm">
          <Stack spacing={4} alignItems="center">
            {/* Header */}
            <Box sx={{ textAlign: "center" }}>
              <Chip
                label="Contact Us"
                sx={{
                  mb: 2,
                  bgcolor: "rgba(26,115,232,0.1)",
                  color: "primary.main",
                  fontWeight: 600,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: 32, md: 42 },
                  fontWeight: 800,
                  mb: 1.5,
                  background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Get in Touch
              </Typography>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: 17,
                  lineHeight: 1.7,
                  textAlign: "center",
                }}
              >
                We'd love to hear from you. Choose how you'd like to connect with us.
              </Typography>
            </Box>

            {/* Feedback Form Card */}
            <Card
              elevation={0}
              sx={{
                p: 4,
                width: "100%",
                borderRadius: 4,
                border: "1px solid rgba(26,115,232,0.15)",
                bgcolor: "rgba(26,115,232,0.02)",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: "rgba(26,115,232,0.1)",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <FeedbackRoundedIcon sx={{ color: "primary.main", fontSize: 32 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 1 }}>
                Share Your Feedback
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 3 }}>
                Help us improve OpenResearch.AI with your valuable feedback. Takes only 2-3 minutes.
              </Typography>
              <Button
                variant="contained"
                size="large"
                href={googleFormUrl}
                target="_blank"
                endIcon={<OpenInNewRoundedIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(26,115,232,0.3)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(26,115,232,0.4)",
                  },
                }}
              >
                Open Feedback Form
              </Button>
            </Card>

            {/* Email Card */}
            <Card
              elevation={0}
              sx={{
                p: 4,
                width: "100%",
                borderRadius: 4,
                border: "1px solid rgba(0,0,0,0.08)",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: "rgba(34,197,94,0.1)",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <EmailRoundedIcon sx={{ color: "#22c55e", fontSize: 32 }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 1 }}>
                Email Us Directly
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 2 }}>
                For support, questions, or partnerships
              </Typography>
              <Typography
                component="a"
                href="mailto:openresearchai24@gmail.com"
                sx={{
                  display: "inline-block",
                  color: "primary.main",
                  fontWeight: 700,
                  fontSize: 18,
                  textDecoration: "none",
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "rgba(26,115,232,0.06)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(26,115,232,0.12)",
                  },
                }}
              >
                openresearchai24@gmail.com
              </Typography>
            </Card>

            {/* Response time note */}
            <Stack direction="row" spacing={1} alignItems="center">
              <SupportAgentRoundedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                We try to quickly respond to your email.
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </MarketingLayout>
  );
}

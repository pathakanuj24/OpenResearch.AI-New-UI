"use client";

import { Box, Container, Divider, IconButton, Stack, Typography } from "@mui/material";
import Link from "next/link";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { routes } from "@/lib/routes";

const footerLinks = {
  Company: [
    { label: "About", href: routes.about },
    { label: "Contact", href: routes.contact },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export default function MarketingFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 6,
        borderTop: "1px solid rgba(0,0,0,0.06)",
        bgcolor: "#fafafa",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 5, md: 8 }}
          justifyContent="space-between"
        >
          {/* Brand Section */}
          <Box sx={{ maxWidth: 280 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 100%)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ color: "white", fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                OpenResearch
              </Typography>
            </Stack>
            <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.7, mb: 2.5 }}>
              AI-powered research assistant that helps you understand papers faster with summaries,
              glossaries, and intelligent chat.
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
              >
                <GitHubIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
              >
                <TwitterIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
              >
                <LinkedInIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Box>

          {/* Links Sections */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 4, sm: 8 }}
          >
            {Object.entries(footerLinks).map(([title, links]) => (
              <Box key={title}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 14,
                    mb: 2,
                    color: "text.primary",
                  }}
                >
                  {title}
                </Typography>
                <Stack spacing={1.5}>
                  {links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      style={{ textDecoration: "none" }}
                    >
                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: 14,
                          transition: "color 0.2s",
                          "&:hover": { color: "primary.main" },
                        }}
                      >
                        {link.label}
                      </Typography>
                    </Link>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ my: 4 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "center" }}
          spacing={2}
        >
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            © {new Date().getFullYear()} OpenResearch.AI. All rights reserved.
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            Made with care for researchers everywhere.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

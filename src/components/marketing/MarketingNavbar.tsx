"use client";

import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { routes } from "@/lib/routes";

const nav = [
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
];

export default function MarketingNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          bgcolor: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ px: { xs: 0 }, minHeight: { xs: 64, md: 72 } }}>
            {/* Logo */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              onClick={() => router.push(routes.home)}
              sx={{ cursor: "pointer" }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 100%)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
                OpenResearch.AI
              </Typography>
            </Stack>

            {/* Desktop Nav */}
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ ml: 6, display: { xs: "none", md: "flex" } }}
            >
              {nav.map((n) => (
                <Button
                  key={n.href}
                  onClick={() => router.push(n.href)}
                  sx={{
                    fontWeight: 500,
                    fontSize: 14,
                    color: pathname === n.href ? "primary.main" : "text.secondary",
                    px: 2,
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.04)",
                      color: "text.primary",
                    },
                  }}
                >
                  {n.label}
                </Button>
              ))}
            </Stack>

            <Box sx={{ flex: 1 }} />

            {/* Desktop Auth Buttons */}
            <Stack direction="row" spacing={1.5} sx={{ display: { xs: "none", md: "flex" } }}>
              <Button
                onClick={() => router.push(routes.login)}
                sx={{
                  fontWeight: 600,
                  color: "text.secondary",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                }}
              >
                Sign in
              </Button>
              <Button
                onClick={() => router.push(routes.signup)}
                variant="contained"
                sx={{
                  fontWeight: 600,
                  borderRadius: 2.5,
                  px: 2.5,
                  boxShadow: "0 2px 8px rgba(26,115,232,0.25)",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(26,115,232,0.35)",
                  },
                }}
              >
                let's Learn
              </Button>
            </Stack>

            {/* Mobile Menu Button */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "flex", md: "none" } }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 280 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <List>
            {nav.map((n) => (
              <ListItemButton
                key={n.href}
                onClick={() => {
                  router.push(n.href);
                  setMobileOpen(false);
                }}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemText
                  primary={n.label}
                  primaryTypographyProps={{
                    fontWeight: pathname === n.href ? 600 : 500,
                    color: pathname === n.href ? "primary.main" : "text.primary",
                  }}
                />
              </ListItemButton>
            ))}
          </List>

          <Stack spacing={1.5} sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                router.push(routes.login);
                setMobileOpen(false);
              }}
              sx={{ borderRadius: 2.5, fontWeight: 600 }}
            >
              Sign in
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                router.push(routes.signup);
                setMobileOpen(false);
              }}
              sx={{ borderRadius: 2.5, fontWeight: 600 }}
            >
              Get Started
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

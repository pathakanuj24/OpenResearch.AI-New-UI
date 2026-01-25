"use client";

import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { marketing } from "@/data/marketing";

const nav = [
  { label: "Features", href: routes.features },
  { label: "How it works", href: routes.how },
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
];

export default function MarketingNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        bgcolor: "rgba(247,248,251,0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Toolbar>
        <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            onClick={() => router.push(routes.home)}
            sx={{ cursor: "pointer" }}
          >
            
            <Typography sx={{ fontWeight: 950, color: "text.primary" }}>
              {marketing.brand}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
            {nav.map((n) => (
              <Button
                key={n.href}
                onClick={() => router.push(n.href)}
                sx={{
                  fontWeight: 800,
                  color: pathname === n.href ? "primary.main" : "text.secondary",
                }}
              >
                {n.label}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button onClick={() => router.push(routes.login)} variant="text" sx={{ fontWeight: 900 }}>
              Sign in
            </Button>
            <Button
              onClick={() => router.push(routes.signup)}
              variant="contained"
              sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" }, fontWeight: 900 }}
            >
              Sign up
            </Button>
          </Stack>
        </Container>
      </Toolbar>
    </AppBar>
  );
}


"use client";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";
import { signOut } from "firebase/auth";

import { dashboardNav } from "@/lib/dashboardNav";
import useCurrentUser from "@/lib/auth/useCurrentUser";
import { auth } from "@/lib/firebase";

const SIDEBAR_W = 280;

// black default for sidebar labels/icons
const NAV_DEFAULT = "#111827";

function useLogout() {
  const router = useRouter();

  return async () => {
    try {
      await signOut(auth);
    } finally {
      router.push("/login");
    }
  };
}

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  const items = useMemo(() => dashboardNav, []);
  const user = useCurrentUser();

  const displayName = user?.displayName || "Your Account";
  const email = user?.email || "";
  const photoURL = user?.photoURL || "";
  const fallbackLetter = (displayName?.[0] || email?.[0] || "U").toUpperCase();

  const Sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2.2 }}>
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          sx={{ cursor: "pointer" }}
          onClick={() => router.push("/dashboard")}
        >
          <Typography sx={{ fontWeight: 950, letterSpacing: "-0.01em", color: NAV_DEFAULT }}>
            OpenResearch.AI
          </Typography>
        </Stack>
      </Box>

      <Divider />

      {/* Nav */}
      <List sx={{ px: 1.2, py: 1 }}>
        {items.map((it) => {
          const Icon = it.icon;
          const active = isActive(pathname, it.href);

          return (
            <ListItemButton
              key={it.label}
              onClick={() => {
                if (it.action === "logout") {
                  void logout();
                  return;
                }
                if (it.href) router.push(it.href);
                setOpen(false);
              }}
              sx={{
                mb: 0.5,
                borderRadius: 3,
                px: 1.5,
                py: 1.1,
                bgcolor: active ? "rgba(26,115,232,0.10)" : "transparent",
                "&:hover": {
                  bgcolor: active ? "rgba(26,115,232,0.14)" : "rgba(0,0,0,0.05)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: active ? "primary.main" : NAV_DEFAULT, // ✅ BLACK
                }}
              >
                <Icon />
              </ListItemIcon>

              <ListItemText
                primary={it.label}
                primaryTypographyProps={{
                  fontWeight: active ? 900 : 700,
                  color: active ? "primary.main" : NAV_DEFAULT, // ✅ BLACK
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* User footer */}
      <Box sx={{ mt: "auto", px: 2.5, pb: 2.5 }}>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar src={photoURL} alt={displayName} sx={{ width: 34, height: 34 }}>
            {fallbackLetter}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 14, lineHeight: 1.2 }} noWrap>
              {displayName}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 12 }} noWrap>
              {email || "Not signed in"}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default" }}>
      {/* Desktop sidebar */}
      <Box
        sx={{
          width: SIDEBAR_W,
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          borderRight: "1px solid rgba(0,0,0,0.06)",
          bgcolor: "white",
        }}
      >
        {Sidebar}
      </Box>

      {/* Mobile drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: SIDEBAR_W },
        }}
      >
        {Sidebar}
      </Drawer>

      {/* Main */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
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
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
              aria-label="Open menu"
            >
              <MenuRoundedIcon />
            </IconButton>

            <Typography sx={{ fontWeight: 950, color: "text.primary" }}>
              {pathname?.startsWith("/dashboard") ? "Dashboard" : "OpenResearch.AI"}
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar src={photoURL} alt={displayName} sx={{ width: 32, height: 32 }}>
                {fallbackLetter}
              </Avatar>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}

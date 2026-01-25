"use client";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";
import { signOut } from "firebase/auth";

import { dashboardNav } from "@/lib/dashboardNav";
import useCurrentUser from "@/lib/auth/useCurrentUser";
import { auth } from "@/lib/firebase";

const SIDEBAR_W = 260;

function useLogout() {
  const router = useRouter();

  return async () => {
    try {
      await signOut(auth);
    } finally {
      router.push("/");
    }
  };
}

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

// Get page title from pathname
function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.includes("/upload")) return "Upload Paper";
  if (pathname.includes("/library")) return "Library";
  if (pathname.includes("/chat")) return "AI Chat";
  if (pathname.includes("/learn")) return "Learn";
  if (pathname.includes("/graph")) return "Knowledge Graph";
  if (pathname.includes("/discover")) return "Discover";
  if (pathname.includes("/profile")) return "Profile";
  return "Dashboard";
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
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ cursor: "pointer" }}
          onClick={() => router.push("/dashboard")}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              background: "linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ color: "white", fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}>
            OpenResearch.AI
          </Typography>
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, mb: 1 }}>
        <TextField
          size="small"
          placeholder="Search..."
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              bgcolor: "rgba(0,0,0,0.03)",
              fontSize: 14,
              "& fieldset": { border: "none" },
              "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
              "&.Mui-focused": { bgcolor: "white", boxShadow: "0 0 0 2px rgba(26,115,232,0.2)" },
            },
          }}
        />
      </Box>

      {/* Nav */}
      <List sx={{ px: 1.5, py: 1, flex: 1 }}>
        {items.map((it, idx) => {
          const Icon = it.icon;
          const active = isActive(pathname, it.href);
          const isLogout = it.action === "logout";

          // Add divider before profile/logout
          if (it.label === "My Profile") {
            return (
              <Box key={it.label}>
                <Divider sx={{ my: 1.5, mx: 1 }} />
                <ListItemButton
                  onClick={() => {
                    if (it.href) router.push(it.href);
                    setOpen(false);
                  }}
                  sx={{
                    mb: 0.5,
                    borderRadius: 2.5,
                    px: 1.5,
                    py: 1,
                    bgcolor: active ? "rgba(26,115,232,0.08)" : "transparent",
                    "&:hover": { bgcolor: active ? "rgba(26,115,232,0.12)" : "rgba(0,0,0,0.04)" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: active ? "primary.main" : "text.secondary" }}>
                    <Icon sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={it.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: active ? 600 : 500,
                      color: active ? "primary.main" : "text.primary",
                    }}
                  />
                </ListItemButton>
              </Box>
            );
          }

          return (
            <ListItemButton
              key={it.label}
              onClick={() => {
                if (isLogout) {
                  void logout();
                  return;
                }
                if (it.href) router.push(it.href);
                setOpen(false);
              }}
              sx={{
                mb: 0.5,
                borderRadius: 2.5,
                px: 1.5,
                py: 1,
                bgcolor: active ? "rgba(26,115,232,0.08)" : "transparent",
                "&:hover": { bgcolor: active ? "rgba(26,115,232,0.12)" : "rgba(0,0,0,0.04)" },
                ...(isLogout && {
                  color: "error.main",
                  "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: isLogout ? "error.main" : active ? "primary.main" : "text.secondary",
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={it.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: isLogout ? "error.main" : active ? "primary.main" : "text.primary",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Upgrade CTA */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: "linear-gradient(135deg, rgba(26,115,232,0.08) 0%, rgba(66,133,244,0.12) 100%)",
            border: "1px solid rgba(26,115,232,0.15)",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5 }}>
            Upgrade to Pro
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 12, mb: 1.5, lineHeight: 1.5 }}>
            Unlimited papers, priority analysis, and advanced features.
          </Typography>
          <Button
            size="small"
            variant="contained"
            fullWidth
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              py: 0.8,
            }}
          >
            Upgrade Now
          </Button>
        </Box>
      </Box>

      {/* User footer */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
          }}
          onClick={() => router.push("/dashboard/profile")}
        >
          <Avatar
            src={photoURL}
            alt={displayName}
            sx={{
              width: 36,
              height: 36,
              fontSize: 14,
              fontWeight: 600,
              bgcolor: "primary.main",
            }}
          >
            {fallbackLetter}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }} noWrap>
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
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#f8fafc" }}>
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
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            bgcolor: "rgba(248,250,252,0.8)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: { xs: 56, md: 64 } }}>
            <IconButton
              onClick={() => setOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
              aria-label="Open menu"
            >
              <MenuRoundedIcon />
            </IconButton>

            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
              {getPageTitle(pathname)}
            </Typography>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <NotificationsNoneRoundedIcon sx={{ fontSize: 22 }} />
              </IconButton>
              <Avatar
                src={photoURL}
                alt={displayName}
                sx={{
                  width: 34,
                  height: 34,
                  ml: 1,
                  fontSize: 13,
                  fontWeight: 600,
                  bgcolor: "primary.main",
                  cursor: "pointer",
                }}
                onClick={() => router.push("/dashboard/profile")}
              >
                {fallbackLetter}
              </Avatar>
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
}

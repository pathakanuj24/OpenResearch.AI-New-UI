"use client";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo, useState } from "react";
import { signOut } from "firebase/auth";

import { dashboardNav } from "@/lib/dashboardNav";
import useCurrentUser from "@/lib/auth/useCurrentUser";
import { auth } from "@/lib/firebase";
import { usePaperStore } from "@/lib/papers/paperStore";

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

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  const items = useMemo(() => dashboardNav, []);
  const user = useCurrentUser();
  
  // Global upload state
  const { upload } = usePaperStore();
  const { isUploading, progress, file: uploadingFile } = upload;

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

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* Global Upload Progress Indicator */}
              {isUploading && (
                <Tooltip title={`Uploading: ${uploadingFile?.name || 'file'} (${Math.round(progress)}%)`}>
                  <Box
                    onClick={() => router.push("/dashboard/upload")}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 0.5, sm: 1 },
                      px: { xs: 1, sm: 1.5 },
                      py: 0.75,
                      borderRadius: 2,
                      bgcolor: "rgba(26,115,232,0.08)",
                      cursor: "pointer",
                      mr: 1,
                      "&:hover": {
                        bgcolor: "rgba(26,115,232,0.12)",
                      },
                    }}
                  >
                    <CloudUploadRoundedIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: "primary.main" }} />
                    <Box sx={{ width: { xs: 50, sm: 80 } }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: "rgba(26,115,232,0.2)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                    <Typography sx={{ fontSize: { xs: 10, sm: 12 }, fontWeight: 600, color: "primary.main", minWidth: { xs: 24, sm: 32 } }}>
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                </Tooltip>
              )}
              
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

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import { useAuthStore } from "@/lib/auth/authStore";
import { routes } from "@/lib/routes";

type PublicRouteProps = {
  children: React.ReactNode;
};

/**
 * PublicRoute - For auth pages (login, signup, forgot-password)
 * Redirects authenticated users to dashboard
 */
export default function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (!loading && user) {
      router.replace(routes.dashboard);
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#0e0e0f",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} sx={{ color: "#1976ff" }} />
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
            Loading...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // If authenticated, show redirect message (redirect is in progress)
  if (user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#0e0e0f",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} sx={{ color: "#1976ff" }} />
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
            Redirecting to dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Not authenticated, show auth page
  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import { useAuthStore } from "@/lib/auth/authStore";
import { routes } from "@/lib/routes";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    // Only redirect after auth state is determined (not loading)
    if (!loading && !user) {
      router.replace(routes.login);
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
          bgcolor: "#fafafa",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} sx={{ color: "#1a73e8" }} />
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Loading...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Don't render children if not authenticated (redirect is in progress)
  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fafafa",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={40} sx={{ color: "#1a73e8" }} />
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Redirecting to login...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}

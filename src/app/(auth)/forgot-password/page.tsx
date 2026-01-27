"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthShell from "@/components/auth/AuthShell";
import { routes } from "@/lib/routes";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function firebaseFriendlyError(code?: string) {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return "Failed to send reset email. Please try again.";
  }
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const emailError = !email.trim()
    ? "Email is required."
    : !emailRegex.test(email.trim())
    ? "Enter a valid email address."
    : "";

  const isFormValid = !emailError;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched(true);

    if (!isFormValid) return;

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(firebaseFriendlyError(err?.code) || err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      titleLeft="Reset your password"
      subtitleLeft="We'll send you a link to reset your password and get back to your research."
      stats={[
        { label: "Secure reset" },
        { label: "Quick recovery" },
      ]}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 520,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          bgcolor: "white",
          boxShadow: "0 12px 30px rgba(16,24,40,0.08)",
        }}
      >
        {/* Back to login */}
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.push(routes.login)}
          sx={{
            mb: 2,
            color: "text.secondary",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
          }}
        >
          Back to sign in
        </Button>

        {success ? (
          // Success state
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "rgba(34,197,94,0.1)",
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 32, color: "#22c55e" }} />
            </Box>
            <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 1 }}>
              Check your email
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 3 }}>
              We've sent a password reset link to
              <br />
              <strong>{email}</strong>
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 3 }}>
              Didn't receive the email? Check your spam folder or try again.
            </Typography>
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                  setTouched(false);
                }}
                sx={{
                  height: 48,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                Try another email
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => router.push(routes.login)}
                sx={{
                  height: 48,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  bgcolor: "#1063ff",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0b54dc" },
                }}
              >
                Return to sign in
              </Button>
            </Stack>
          </Box>
        ) : (
          // Form state
          <>
            <Typography sx={{ fontSize: 28, fontWeight: 900, textAlign: "center" }}>
              Forgot password?
            </Typography>
            <Typography sx={{ textAlign: "center", color: "text.secondary", mt: 1 }}>
              Enter your email and we'll send you a reset link
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Email address</Typography>
              <TextField
                fullWidth
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                autoComplete="email"
                autoFocus
                error={touched && !!emailError}
                helperText={touched ? emailError : " "}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                type="submit"
                disabled={loading || !isFormValid}
                sx={{
                  mt: 2,
                  height: 52,
                  borderRadius: 2.5,
                  fontWeight: 900,
                  bgcolor: "#1063ff",
                  color: "white",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0b54dc" },
                  "&.Mui-disabled": { bgcolor: "#c9d7ff", color: "white" },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Send reset link"}
              </Button>

              <Typography sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
                Remember your password?{" "}
                <Button
                  variant="text"
                  onClick={() => router.push(routes.login)}
                  sx={{ textTransform: "none", fontWeight: 900 }}
                >
                  Sign in
                </Button>
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </AuthShell>
  );
}

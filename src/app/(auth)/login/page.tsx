"use client";

import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthShell from "@/components/auth/AuthShell";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function firebaseFriendlyError(code?: string) {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Try again.";
    case "auth/invalid-credential":
      return "Invalid credentials. Please check your email/password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet.";
    default:
      return "Sign in failed. Please try again.";
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailError =
    !email.trim()
      ? "Email is required."
      : !emailRegex.test(email.trim())
      ? "Enter a valid email address."
      : "";

  const passwordError = !password.trim() ? "Password is required." : "";

  const isFormValid = !emailError && !passwordError;

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ email: true, password: true });

    if (!isFormValid) return;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/dashboard/library");
    } catch (err: any) {
      setError(firebaseFriendlyError(err?.code) || err?.message);
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/dashboard");
    } catch (err: any) {
      setError(firebaseFriendlyError(err?.code) || err?.message);
    } finally {
      setLoading(false);
    }
  };

  const onForgotPassword = () => {
    alert("Forgot password flow coming next.");
  };

  return (
    <AuthShell
      titleLeft="Welcome back"
      subtitleLeft="Continue your research journey. Your papers and insights are waiting for you."
      stats={[
        { label: "2,000+ Papers analyzed" },
        { label: "500+ Researchers" },
        { label: "50k+ Queries answered" },
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
        <Typography sx={{ fontSize: 30, fontWeight: 900, textAlign: "center" }}>
          Sign in
        </Typography>
        <Typography sx={{ textAlign: "center", color: "text.secondary", mt: 1 }}>
          Enter your credentials to access your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={onLogin} sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Email</Typography>
          <TextField
            fullWidth
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            autoComplete="email"
            error={touched.email && !!emailError}
            helperText={touched.email ? emailError : " "}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>Password</Typography>
            <Button onClick={onForgotPassword} variant="text" sx={{ textTransform: "none", fontWeight: 700 }}>
              Forgot password?
            </Button>
          </Stack>

          <TextField
            fullWidth
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            autoComplete="current-password"
            error={touched.password && !!passwordError}
            helperText={touched.password ? passwordError : " "}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                    {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                  </IconButton>
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
              "&:hover": { bgcolor: "#0b54dc" },
              "&.Mui-disabled": { bgcolor: "#c9d7ff", color: "white" },
            }}
          >
            {loading ? <CircularProgress size={22} /> : "Sign in →"}
          </Button>

          <Divider sx={{ my: 3, color: "text.secondary" }}>OR CONTINUE WITH</Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={onGoogle}
            disabled={loading}
            startIcon={<GoogleIcon />}
            sx={{
              height: 50,
              borderRadius: 2.5,
              borderColor: "#e5e7eb",
              color: "text.primary",
              fontWeight: 800,
              "&:hover": { borderColor: "#cfd4dc", bgcolor: "#fafafa" },
            }}
          >
            Continue with Google
          </Button>

          <Typography sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
            Don&apos;t have an account?{" "}
            <Button
              variant="text"
              onClick={() => router.push("/signup")}
              sx={{ textTransform: "none", fontWeight: 900 }}
            >
              Sign up free
            </Button>
          </Typography>
        </Box>
      </Paper>
    </AuthShell>
  );
}

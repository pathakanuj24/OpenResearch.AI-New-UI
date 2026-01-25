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
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthShell from "@/components/auth/AuthShell";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // (Optional) Later: send fullName to backend/profile store
      router.push("/dashboard/library");
    } catch (err: any) {
      setError(err?.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push("/dashboard/library");
    } catch (err: any) {
      setError(err?.message || "Google signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      titleLeft="Start your research journey"
      subtitleLeft="Join thousands of researchers using AI to understand papers faster and discover new insights."
      bullets={[
        "Upload unlimited papers",
        "AI-powered chat & analysis",
        "Personalized learning paths",
        "Knowledge graph visualization",
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
          Create account
        </Typography>
        <Typography sx={{ textAlign: "center", color: "text.secondary", mt: 1 }}>
          Start your free trial today
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
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
        </Box>

        <Divider sx={{ my: 3, color: "text.secondary" }}>OR SIGN UP WITH EMAIL</Divider>

        <Box component="form" onSubmit={onSignup}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Full name</Typography>
          <TextField
            fullWidth
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />

          <Typography sx={{ fontWeight: 700, mb: 1, mt: 2 }}>Email</Typography>
          <TextField
            fullWidth
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />

          <Typography sx={{ fontWeight: 700, mb: 1, mt: 2 }}>Password</Typography>
          <TextField
            fullWidth
            placeholder="Create a password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
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
            disabled={loading}
            sx={{
              mt: 3,
              height: 52,
              borderRadius: 2.5,
              fontWeight: 900,
              bgcolor: "#1063ff",
              color: "white",
              "&:hover": { bgcolor: "#0b54dc" },
            }}
          >
            {loading ? <CircularProgress size={22} /> : "Create account  →"}
          </Button>

          <Typography sx={{ textAlign: "center", mt: 2, fontSize: 13, color: "text.secondary" }}>
            By creating an account, you agree to our{" "}
            <b style={{ color: "#1063ff" }}>Terms of Service</b> and{" "}
            <b style={{ color: "#1063ff" }}>Privacy Policy</b>
          </Typography>

          <Typography sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
            Already have an account?{" "}
            <Button
              variant="text"
              onClick={() => router.push("/login")}
              sx={{ textTransform: "none", fontWeight: 900 }}
            >
              Sign in
            </Button>
          </Typography>
        </Box>
      </Paper>
    </AuthShell>
  );
}

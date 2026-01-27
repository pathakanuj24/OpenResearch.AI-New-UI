"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import { signOut } from "firebase/auth";

import useCurrentUser from "@/lib/auth/useCurrentUser";
import { useAnalyses } from "@/lib/hooks/useAnalyses";
import { auth } from "@/lib/firebase";

export default function ProfilePage() {
  const router = useRouter();
  const user = useCurrentUser();
  const { data: analysesData } = useAnalyses(100, 0);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  const papers = analysesData?.analyses || [];
  const totalPapers = analysesData?.total || papers.length;
  const analyzedPapers = papers.filter((p) => p.has_analysis).length;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const email = user?.email || "Not available";
  const photoURL = user?.photoURL || "";
  const name = user?.displayName || "User";
  const createdAt = user?.metadata?.creationTime;
  const fallbackLetter = (name?.[0] || email?.[0] || "U").toUpperCase();

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      {/* Header Card */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 4,
          overflow: "hidden",
          mb: 3,
        }}
      >
        {/* Cover */}
        <Box
          sx={{
            height: 120,
            background: "linear-gradient(135deg, #1a73e8 0%, #6366f1 50%, #a855f7 100%)",
          }}
        />

        {/* Profile Info */}
        <Box sx={{ px: 4, pb: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "center", sm: "flex-end" }}
            sx={{ mt: -6 }}
          >
            {/* Avatar */}
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={photoURL}
                alt={name}
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  fontWeight: 700,
                  bgcolor: "primary.main",
                  border: "4px solid white",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                {fallbackLetter}
              </Avatar>
              <IconButton
                size="small"
                sx={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  bgcolor: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  "&:hover": { bgcolor: "white" },
                }}
              >
                <CameraAltRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            {/* Name & Email */}
            <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" }, pt: { xs: 0, sm: 2 } }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "center", sm: "flex-start" }}>
                {isEditing ? (
                  <TextField
                    size="small"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    sx={{ width: 200 }}
                  />
                ) : (
                  <Typography sx={{ fontWeight: 700, fontSize: 28 }}>{name}</Typography>
                )}
                <IconButton
                  size="small"
                  onClick={() => setIsEditing(!isEditing)}
                  sx={{ color: "text.secondary" }}
                >
                  <EditRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent={{ xs: "center", sm: "flex-start" }}
                sx={{ mt: 0.5 }}
              >
                <EmailRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>{email}</Typography>
              </Stack>
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={1.5} sx={{ pt: { xs: 0, sm: 2 } }}>
              {isEditing && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setIsEditing(false)}
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  Save Changes
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<LogoutRoundedIcon />}
                onClick={handleLogout}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Logout
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
        {/* Stats Card */}
        <Card
          elevation={0}
          sx={{
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 3,
            p: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 3 }}>Your Stats</Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: "rgba(26,115,232,0.06)",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: "rgba(26,115,232,0.1)",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <DescriptionRoundedIcon sx={{ color: "primary.main" }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 28, color: "primary.main" }}>
                {totalPapers}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Total Papers</Typography>
            </Box>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: "rgba(34,197,94,0.06)",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: "rgba(34,197,94,0.1)",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <SchoolRoundedIcon sx={{ color: "success.main" }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 28, color: "success.main" }}>
                {analyzedPapers}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Analyzed</Typography>
            </Box>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: "rgba(168,85,247,0.06)",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: "rgba(168,85,247,0.1)",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <ChatRoundedIcon sx={{ color: "#a855f7" }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: 28, color: "#a855f7" }}>
                --
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Conversations</Typography>
            </Box>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: "rgba(239,68,68,0.06)",
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: "rgba(239,68,68,0.1)",
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 1.5,
                }}
              >
                <CalendarTodayRoundedIcon sx={{ color: "error.main" }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: "error.main" }}>
                {createdAt ? formatDate(createdAt) : "--"}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>Member Since</Typography>
            </Box>
          </Box>
        </Card>

        {/* Account Details Card */}
        <Card
          elevation={0}
          sx={{
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 3,
            p: 3,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 3 }}>Account Details</Typography>

          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ color: "text.secondary", fontSize: 12, mb: 0.5 }}>
                Display Name
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{name}</Typography>
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ color: "text.secondary", fontSize: 12, mb: 0.5 }}>
                Email Address
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{email}</Typography>
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ color: "text.secondary", fontSize: 12, mb: 0.5 }}>
                Account Type
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Free Plan</Typography>
                <Chip
                  label="Active"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: "rgba(34,197,94,0.1)",
                    color: "success.main",
                  }}
                />
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ color: "text.secondary", fontSize: 12, mb: 0.5 }}>
                Authentication Provider
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                  {user?.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email"}
                </Typography>
                <Chip
                  label="Verified"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 600,
                    bgcolor: "rgba(26,115,232,0.1)",
                    color: "primary.main",
                  }}
                />
              </Stack>
            </Box>

          </Stack>
        </Card>
      </Box>

      {/* Danger Zone */}
      <Card
        elevation={0}
        sx={{
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 3,
          p: 3,
          mt: 3,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 1, color: "error.main" }}>
          Danger Zone
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 14, mb: 2 }}>
          Once you delete your account, there is no going back. Please be certain.
        </Typography>
        <Button
          variant="outlined"
          color="error"
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Delete Account
        </Button>
      </Card>
    </Box>
  );
}

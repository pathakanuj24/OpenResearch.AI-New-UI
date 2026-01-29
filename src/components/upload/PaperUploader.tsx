"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Button,
  Stack,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

type Props = {
  file: File | null;
  progress: number; // 0..100
  isLoading: boolean;
  error: string | null;

  onPick: (file: File) => void;
  onClear: () => void;
  onUpload: () => void;
};

// Progress stages based on percentage
// Upload: 0-30%, Processing: 30-50%, Analyzing: 50-95%, Finishing: 95-100%
function getProgressStage(progress: number) {
  if (progress < 30) {
    return {
      stage: 1,
      label: "Uploading",
      description: "Securely transferring your PDF...",
      icon: CloudUploadRoundedIcon,
      color: "#1a73e8",
    };
  } else if (progress < 50) {
    return {
      stage: 2,
      label: "Processing",
      description: "Extracting text and structure...",
      icon: DescriptionRoundedIcon,
      color: "#7c3aed",
    };
  } else if (progress < 95) {
    return {
      stage: 3,
      label: "Analyzing",
      description: "AI generating summary and glossary...",
      icon: AutoAwesomeRoundedIcon,
      color: "#f97316",
    };
  } else {
    return {
      stage: 4,
      label: "Finishing",
      description: "Almost done, preparing results...",
      icon: CheckCircleRoundedIcon,
      color: "#22c55e",
    };
  }
}

// Animated Progress Bar Component
function AnimatedProgressBar({ progress }: { progress: number }) {
  return (
    <Box
      sx={{
        width: "100%",
        height: 8,
        borderRadius: 4,
        bgcolor: "rgba(0,0,0,0.06)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated gradient background */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          height: "100%",
          borderRadius: 4,
          background: "linear-gradient(90deg, #1a73e8 0%, #7c3aed 50%, #1a73e8 100%)",
          backgroundSize: "200% 100%",
          position: "relative",
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          }}
        />
      </motion.div>
    </Box>
  );
}

// Stage Indicator Component
function StageIndicator({ currentStage }: { currentStage: number }) {
  const stages = [
    { num: 1, label: "Upload" },
    { num: 2, label: "Process" },
    { num: 3, label: "Analyze" },
    { num: 4, label: "Done" },
  ];

  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
      {stages.map((stage, idx) => (
        <Stack key={stage.num} direction="row" alignItems="center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{
              scale: currentStage >= stage.num ? 1 : 0.8,
              opacity: currentStage >= stage.num ? 1 : 0.4,
            }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: currentStage >= stage.num ? "primary.main" : "rgba(0,0,0,0.08)",
                color: currentStage >= stage.num ? "white" : "text.secondary",
                fontSize: 12,
                fontWeight: 700,
                transition: "all 0.3s ease",
              }}
            >
              {currentStage > stage.num ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
              ) : (
                stage.num
              )}
            </Box>
          </motion.div>
          <Typography
            sx={{
              ml: 0.8,
              fontSize: 12,
              fontWeight: currentStage === stage.num ? 700 : 500,
              color: currentStage >= stage.num ? "text.primary" : "text.secondary",
              display: { xs: "none", sm: "block" },
            }}
          >
            {stage.label}
          </Typography>
          {idx < stages.length - 1 && (
            <Box
              sx={{
                width: { xs: 16, sm: 32 },
                height: 2,
                mx: 1,
                bgcolor: currentStage > stage.num ? "primary.main" : "rgba(0,0,0,0.08)",
                borderRadius: 1,
                transition: "all 0.3s ease",
              }}
            />
          )}
        </Stack>
      ))}
    </Stack>
  );
}

// Spinning Icon Component
function SpinningIcon({ Icon, color }: { Icon: any; color: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        background: `${color}15`,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Icon sx={{ fontSize: 32, color }} />
    </motion.div>
  );
}

// Pulsing Dots Component
function PulsingDots() {
  return (
    <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "#1a73e8",
          }}
        />
      ))}
    </Stack>
  );
}

export default function PaperUploader({
  file,
  progress,
  isLoading,
  error,
  onPick,
  onClear,
  onUpload,
}: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const fileMeta = useMemo(() => {
    if (!file) return null;
    const mb = (file.size / (1024 * 1024)).toFixed(2);
    return { name: file.name, sizeMB: mb };
  }, [file]);

  // Timer for elapsed time
  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading]);

  const progressStage = getProgressStage(progress);
  const StageIcon = progressStage.icon;

  function validateAndPick(f: File) {
    const isPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return;
    onPick(f);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    validateAndPick(f);
    e.currentTarget.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    validateAndPick(f);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(0,0,0,0.08)",
        bgcolor: "white",
        overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        {!isLoading ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Drop area */}
            <Box
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOver(false);
              }}
              onDrop={handleDrop}
              sx={{ p: { xs: 3, md: 4 } }}
            >
              <Box
                component={motion.div}
                animate={{
                  scale: dragOver ? 1.02 : 1,
                  borderColor: dragOver ? "rgba(26,115,232,0.5)" : "rgba(0,0,0,0.1)",
                  backgroundColor: dragOver ? "rgba(26,115,232,0.04)" : "transparent",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                sx={{
                  borderRadius: 3,
                  border: "2px dashed",
                  borderColor: "rgba(0,0,0,0.1)",
                  p: { xs: 3, md: 4 },
                }}
              >
                <Stack spacing={2} alignItems="center">
                  <motion.div
                    animate={{ y: dragOver ? -5 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Box
                      sx={{
                        width: { xs: 56, sm: 72 },
                        height: { xs: 56, sm: 72 },
                        borderRadius: { xs: 3, sm: 4 },
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "rgba(26,115,232,0.08)",
                        color: "primary.main",
                      }}
                    >
                      <UploadFileRoundedIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />
                    </Box>
                  </motion.div>

                  <Box sx={{ textAlign: "center", px: { xs: 1, sm: 0 } }}>
                    <Typography sx={{ fontWeight: 700, fontSize: { xs: 16, sm: 20 }, mb: 0.5 }}>
                      Drag & drop your PDF here
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: { xs: 13, sm: 15 } }}>
                      or click to browse • PDF only • Up to 20MB
                    </Typography>
                  </Box>

                  <Button
                    component="label"
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      mt: 1,
                      fontWeight: 600,
                      px: 3,
                      py: 1.2,
                      borderRadius: 3,
                      boxShadow: "0 2px 8px rgba(26,115,232,0.25)",
                    }}
                  >
                    Choose PDF
                    <input hidden type="file" accept="application/pdf" onChange={handleInputChange} />
                  </Button>

                  {/* Selected File */}
                  <AnimatePresence>
                    {fileMeta && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ width: "100%" }}
                      >
                        <Box
                          sx={{
                            mt: 2,
                            width: "100%",
                            borderRadius: 3,
                            border: "1px solid rgba(26,115,232,0.2)",
                            bgcolor: "rgba(26,115,232,0.04)",
                            p: { xs: 1.5, sm: 2 },
                          }}
                        >
                          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
                            <Box
                              sx={{
                                width: { xs: 36, sm: 44 },
                                height: { xs: 36, sm: 44 },
                                borderRadius: 2.5,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: "rgba(239,68,68,0.1)",
                                color: "error.main",
                                flexShrink: 0,
                              }}
                            >
                              <PictureAsPdfRoundedIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
                            </Box>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  fontSize: { xs: 13, sm: 15 },
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={fileMeta.name}
                              >
                                {fileMeta.name}
                              </Typography>
                              <Typography sx={{ color: "text.secondary", fontSize: { xs: 11, sm: 13 } }}>
                                {fileMeta.sizeMB} MB • Ready to analyze
                              </Typography>
                            </Box>

                            <Button
                              onClick={onClear}
                              disabled={isLoading}
                              size="small"
                              sx={{ color: "text.secondary", minWidth: "auto", p: { xs: 0.5, sm: 1 } }}
                            >
                              <CloseRoundedIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                            </Button>
                          </Stack>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Stack>
              </Box>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    <Typography sx={{ color: "error.main", fontWeight: 600, fontSize: 14 }}>
                      {error}
                    </Typography>
                  </Box>
                </motion.div>
              )}

              {/* Actions */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ mt: 3 }}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="center"
              >
                <Button
                  onClick={onUpload}
                  disabled={!file || isLoading}
                  variant="contained"
                  size="large"
                  sx={{
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    minWidth: 200,
                    boxShadow: "0 4px 14px rgba(26,115,232,0.3)",
                    "&:hover": {
                      boxShadow: "0 6px 20px rgba(26,115,232,0.4)",
                    },
                  }}
                >
                  Analyze Paper
                </Button>

                <Button
                  onClick={onClear}
                  disabled={!file || isLoading}
                  variant="text"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  Reset
                </Button>
              </Stack>
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Progress Section */}
            <Box sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={4} alignItems="center">
                {/* Stage Indicator */}
                <StageIndicator currentStage={progressStage.stage} />

                {/* Spinning Icon */}
                <SpinningIcon Icon={StageIcon} color={progressStage.color} />

                {/* Status Text */}
                <Box sx={{ textAlign: "center" }}>
                  <Stack direction="row" alignItems="center" justifyContent="center">
                    <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
                      {progressStage.label}
                    </Typography>
                    <PulsingDots />
                  </Stack>
                  <Typography sx={{ color: "text.secondary", mt: 0.5, fontSize: 15 }}>
                    {progressStage.description}
                  </Typography>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ width: "100%", maxWidth: 400 }}>
                  <AnimatedProgressBar progress={Math.max(2, Math.min(100, progress))} />
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 1.5 }}
                  >
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      Time elapsed: {formatTime(elapsedTime)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "primary.main",
                      }}
                    >
                      {Math.round(progress)}%
                    </Typography>
                  </Stack>
                </Box>

                {/* File Info */}
                {fileMeta && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "rgba(0,0,0,0.02)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      width: "100%",
                      maxWidth: 400,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <PictureAsPdfRoundedIcon sx={{ color: "error.main", fontSize: 20 }} />
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "text.secondary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {fileMeta.name}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {/* Tip */}
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    textAlign: "center",
                    maxWidth: 400,
                  }}
                >
                  Tip: Analysis typically takes 20-40 seconds depending on paper length and complexity.
                </Typography>
              </Stack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
}

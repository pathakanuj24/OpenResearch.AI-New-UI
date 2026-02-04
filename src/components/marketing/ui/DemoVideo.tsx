"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography, IconButton, Stack, Slider } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import VolumeOffRoundedIcon from "@mui/icons-material/VolumeOffRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";

interface DemoVideoProps {
  /** Primary video source (can be .mp4, .mov, .webm, etc.) */
  src: string;
  /** Optional fallback sources for browser compatibility */
  fallbackSources?: { src: string; type: string }[];
  /** Poster image to show before video plays */
  poster?: string;
}

export default function DemoVideo({ src, fallbackSources, poster }: DemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device
  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const getVideoType = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const types: Record<string, string> = {
      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",
      ogg: "video/ogg",
      avi: "video/x-msvideo",
      mkv: "video/x-matroska",
    };
    return types[ext || ""] || "video/mp4";
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds === 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Update duration when video metadata is available
  const updateDuration = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
      setDuration(video.duration);
    }
  }, []);

  // Set up event listeners to catch duration from multiple events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const events = ["loadedmetadata", "loadeddata", "durationchange", "canplay"];
    events.forEach((event) => video.addEventListener(event, updateDuration));

    // Try to get duration immediately if already loaded
    if (video.readyState >= 1) {
      updateDuration();
    }

    return () => {
      events.forEach((event) => video.removeEventListener(event, updateDuration));
    };
  }, [updateDuration]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isEnded) {
      video.currentTime = 0;
      setIsEnded(false);
    }

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      // Also try to update duration here in case it wasn't set
      if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
        if (duration === 0) {
          setDuration(video.duration);
        }
        setProgress((video.currentTime / video.duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsEnded(true);
    setProgress(100);
  };

  const handleProgressChange = (_: Event, value: number | number[]) => {
    const video = videoRef.current;
    if (video && typeof value === "number") {
      const videoDuration = video.duration || duration;
      if (videoDuration > 0) {
        const newTime = (value / 100) * videoDuration;
        video.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress(value);
        setIsEnded(false);
      }
    }
  };

  // Click on progress bar area to seek
  const handleProgressBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    const videoDuration = video.duration || duration;
    
    if (videoDuration > 0) {
      const newTime = (percentage / 100) * videoDuration;
      video.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(percentage);
      setIsEnded(false);
    }
  };

  // Handle controls visibility for touch devices
  const handleContainerClick = () => {
    if (isTouchDevice && isPlaying) {
      setShowControls((prev) => !prev);
    }
  };

  return (
    <Box
      ref={containerRef}
      onMouseEnter={() => !isTouchDevice && setShowControls(true)}
      onMouseLeave={() => !isTouchDevice && isPlaying && setShowControls(false)}
      onClick={handleContainerClick}
      sx={{
        position: "relative",
        borderRadius: { xs: 2, sm: 3, md: 4 },
        overflow: "hidden",
        boxShadow: {
          xs: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
          md: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "#000",
        maxWidth: 1000,
        mx: "auto",
        aspectRatio: "16/9",
        // Ensure full width on mobile
        width: "100%",
      }}
    >
      {/* Video Element with Multiple Sources */}
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        preload="metadata"
        onClick={handlePlayPause}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          cursor: "pointer",
          backgroundColor: "#000",
        }}
      >
        {/* Primary source */}
        <source src={src} type={getVideoType(src)} />
        {/* Fallback sources */}
        {fallbackSources?.map((source, index) => (
          <source key={index} src={source.src} type={source.type} />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Play Button Overlay (when paused or ended) */}
      {(!isPlaying || isEnded) && (
        <Box
          onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.4)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.5)",
              "& .play-btn": {
                transform: "scale(1.1)",
              },
            },
          }}
        >
          <Box
            className="play-btn"
            sx={{
              width: { xs: 64, md: 88 },
              height: { xs: 64, md: 88 },
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              transition: "transform 0.2s ease",
            }}
          >
            {isEnded ? (
              <ReplayRoundedIcon sx={{ fontSize: { xs: 32, md: 48 }, color: "#0f172a" }} />
            ) : (
              <PlayArrowRoundedIcon sx={{ fontSize: { xs: 36, md: 52 }, color: "#0f172a", ml: 0.5 }} />
            )}
          </Box>
        </Box>
      )}

      {/* Bottom Controls Bar */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          px: { xs: 1.5, md: 2 },
          pt: 4,
          pb: { xs: 1, md: 1.5 },
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* Progress Bar */}
        <Box 
          onClick={(e) => { e.stopPropagation(); handleProgressBarClick(e); }}
          sx={{ cursor: "pointer", py: { xs: 1.5, sm: 1 }, touchAction: "none" }}
        >
          <Slider
            value={isNaN(progress) ? 0 : progress}
            onChange={handleProgressChange}
            size="small"
            min={0}
            max={100}
            sx={{
              color: "white",
              height: { xs: 6, sm: 4 },
              mb: { xs: 0.5, sm: 1 },
              "& .MuiSlider-thumb": {
                width: { xs: 18, sm: 14 },
                height: { xs: 18, sm: 14 },
                transition: "0.2s",
                "&:hover, &.Mui-focusVisible": {
                  boxShadow: "0 0 0 6px rgba(255,255,255,0.2)",
                },
              },
              "& .MuiSlider-rail": {
                bgcolor: "rgba(255,255,255,0.3)",
              },
              "& .MuiSlider-track": {
                bgcolor: "white",
              },
            }}
          />
        </Box>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={{ xs: 0, sm: 0.5 }} alignItems="center">
            <IconButton
              onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
              sx={{ 
                color: "white", 
                p: { xs: 1, sm: 0.75 },
                minWidth: { xs: 40, sm: "auto" },
                minHeight: { xs: 40, sm: "auto" },
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              {isPlaying ? (
                <PauseRoundedIcon sx={{ fontSize: { xs: 22, sm: 20, md: 24 } }} />
              ) : isEnded ? (
                <ReplayRoundedIcon sx={{ fontSize: { xs: 22, sm: 20, md: 24 } }} />
              ) : (
                <PlayArrowRoundedIcon sx={{ fontSize: { xs: 22, sm: 20, md: 24 } }} />
              )}
            </IconButton>
            <IconButton
              onClick={(e) => { e.stopPropagation(); handleMuteToggle(); }}
              sx={{ 
                color: "white", 
                p: { xs: 1, sm: 0.75 },
                minWidth: { xs: 40, sm: "auto" },
                minHeight: { xs: 40, sm: "auto" },
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              {isMuted ? (
                <VolumeOffRoundedIcon sx={{ fontSize: { xs: 22, sm: 20, md: 24 } }} />
              ) : (
                <VolumeUpRoundedIcon sx={{ fontSize: { xs: 22, sm: 20, md: 24 } }} />
              )}
            </IconButton>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontSize: { xs: 10, sm: 11, md: 13 },
                fontWeight: 500,
                ml: { xs: 0.5, sm: 1 },
                whiteSpace: "nowrap",
              }}
            >
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
          </Stack>
          <IconButton
            onClick={(e) => { e.stopPropagation(); handleFullscreen(); }}
            sx={{ 
              color: "white", 
              p: { xs: 1, sm: 0.75 },
              minWidth: { xs: 40, sm: "auto" },
              minHeight: { xs: 40, sm: "auto" },
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <FullscreenRoundedIcon sx={{ fontSize: { xs: 22, sm: 20, md: 24 } }} />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}

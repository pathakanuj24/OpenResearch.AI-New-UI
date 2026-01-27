"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  Select,
  MenuItem,
  Tooltip,
  Divider,
  TextField,
  Slider,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import RotateRightRoundedIcon from "@mui/icons-material/RotateRightRounded";
import FitScreenRoundedIcon from "@mui/icons-material/FitScreenRounded";
import FirstPageRoundedIcon from "@mui/icons-material/FirstPageRounded";
import LastPageRoundedIcon from "@mui/icons-material/LastPageRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { Document, Page, pdfjs } from "react-pdf";
import { auth } from "@/lib/firebase";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Use CDN worker matching installed pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Props = {
  fileHash: string;
};

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 175, 200];

export default function PaperViewerClient({ fileHash }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageInput, setPageInput] = useState("1");

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";
        const res = await fetch(`${baseUrl}/papers/${fileHash}/pdf`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch PDF: ${res.status}`);
        }

        const blob = await res.blob();
        if (cancelled) return;

        url = URL.createObjectURL(blob);
        setFileUrl(url);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load PDF");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileHash]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
    setPageInput("1");
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    setError(err.message || "Failed to load PDF document");
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(numPages, page));
      setCurrentPage(newPage);
      setPageInput(String(newPage));
    },
    [numPages]
  );

  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(numPages);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page)) {
      goToPage(page);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePageInputBlur();
    }
  };

  const zoomIn = () => {
    const idx = ZOOM_LEVELS.indexOf(scale);
    if (idx < ZOOM_LEVELS.length - 1) {
      setScale(ZOOM_LEVELS[idx + 1]);
    } else if (scale < 200) {
      setScale(Math.min(200, scale + 25));
    }
  };

  const zoomOut = () => {
    const idx = ZOOM_LEVELS.indexOf(scale);
    if (idx > 0) {
      setScale(ZOOM_LEVELS[idx - 1]);
    } else if (scale > 50) {
      setScale(Math.max(50, scale - 25));
    }
  };

  const fitToWidth = () => {
    setScale(100);
  };

  const rotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const downloadPdf = () => {
    if (fileUrl) {
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = `paper-${fileHash}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: 600,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8f9fa",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 3,
            bgcolor: "rgba(26,115,232,0.1)",
            display: "grid",
            placeItems: "center",
            mb: 2,
          }}
        >
          <DescriptionRoundedIcon sx={{ fontSize: 40, color: "primary.main" }} />
        </Box>
        <CircularProgress size={28} sx={{ mb: 2 }} />
        <Typography sx={{ color: "text.secondary", fontWeight: 500 }}>
          Loading document...
        </Typography>
      </Box>
    );
  }

  if (error || !fileUrl) {
    return (
      <Box
        sx={{
          height: 600,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f8f9fa",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: 3,
            bgcolor: "rgba(239,68,68,0.1)",
            display: "grid",
            placeItems: "center",
            mb: 2,
          }}
        >
          <DescriptionRoundedIcon sx={{ fontSize: 40, color: "error.main" }} />
        </Box>
        <Typography sx={{ color: "error.main", fontWeight: 600, mb: 0.5 }}>
          Failed to load PDF
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
          {error || "PDF not available"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: isFullscreen ? "100vh" : "100%",
        bgcolor: isFullscreen ? "#1a1a1a" : "transparent",
      }}
    >
      {/* Enhanced Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          bgcolor: isFullscreen ? "#2a2a2a" : "white",
          flexShrink: 0,
        }}
      >
        {/* Left: Page Navigation */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="First page">
            <span>
              <IconButton
                size="small"
                onClick={goToFirstPage}
                disabled={currentPage <= 1}
                sx={{ color: isFullscreen ? "white" : "text.secondary" }}
              >
                <FirstPageRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Previous page">
            <span>
              <IconButton
                size="small"
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                sx={{ color: isFullscreen ? "white" : "text.secondary" }}
              >
                <ChevronLeftRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <TextField
              size="small"
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              onKeyDown={handlePageInputKeyDown}
              sx={{
                width: 48,
                "& .MuiOutlinedInput-root": {
                  height: 28,
                  fontSize: 13,
                  "& input": { textAlign: "center", p: 0.5 },
                  bgcolor: isFullscreen ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)",
                  color: isFullscreen ? "white" : "inherit",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
              }}
            />
            <Typography
              sx={{
                fontSize: 13,
                color: isFullscreen ? "rgba(255,255,255,0.7)" : "text.secondary",
              }}
            >
              of {numPages || "..."}
            </Typography>
          </Stack>

          <Tooltip title="Next page">
            <span>
              <IconButton
                size="small"
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
                sx={{ color: isFullscreen ? "white" : "text.secondary" }}
              >
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Last page">
            <span>
              <IconButton
                size="small"
                onClick={goToLastPage}
                disabled={currentPage >= numPages}
                sx={{ color: isFullscreen ? "white" : "text.secondary" }}
              >
                <LastPageRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Center: Zoom Controls */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="Zoom out">
            <span>
              <IconButton
                size="small"
                onClick={zoomOut}
                disabled={scale <= 50}
                sx={{ color: isFullscreen ? "white" : "text.secondary" }}
              >
                <ZoomOutRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ width: 100, px: 1 }}>
            <Slider
              size="small"
              value={scale}
              min={50}
              max={200}
              step={25}
              onChange={(_, v) => setScale(v as number)}
              sx={{
                color: isFullscreen ? "white" : "primary.main",
                "& .MuiSlider-thumb": { width: 14, height: 14 },
              }}
            />
          </Box>

          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 500,
              minWidth: 40,
              color: isFullscreen ? "white" : "text.secondary",
            }}
          >
            {scale}%
          </Typography>

          <Tooltip title="Zoom in">
            <span>
              <IconButton
                size="small"
                onClick={zoomIn}
                disabled={scale >= 200}
                sx={{ color: isFullscreen ? "white" : "text.secondary" }}
              >
                <ZoomInRoundedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, bgcolor: isFullscreen ? "rgba(255,255,255,0.2)" : undefined }} />

          <Tooltip title="Fit to width">
            <IconButton
              size="small"
              onClick={fitToWidth}
              sx={{ color: isFullscreen ? "white" : "text.secondary" }}
            >
              <FitScreenRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Right: Actions */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Tooltip title="Rotate">
            <IconButton
              size="small"
              onClick={rotate}
              sx={{ color: isFullscreen ? "white" : "text.secondary" }}
            >
              <RotateRightRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download PDF">
            <IconButton
              size="small"
              onClick={downloadPdf}
              sx={{ color: isFullscreen ? "white" : "text.secondary" }}
            >
              <DownloadRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
            <IconButton
              size="small"
              onClick={toggleFullscreen}
              sx={{ color: isFullscreen ? "white" : "text.secondary" }}
            >
              {isFullscreen ? (
                <FullscreenExitRoundedIcon fontSize="small" />
              ) : (
                <FullscreenRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* PDF Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          bgcolor: isFullscreen ? "#1a1a1a" : "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          py: 3,
          minHeight: isFullscreen ? "calc(100vh - 56px)" : 540,
        }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
              <CircularProgress size={28} sx={{ color: isFullscreen ? "white" : "primary.main" }} />
              <Typography sx={{ color: isFullscreen ? "rgba(255,255,255,0.7)" : "text.secondary", fontSize: 13 }}>
                Loading page...
              </Typography>
            </Stack>
          }
        >
          <Box
            sx={{
              bgcolor: "white",
              boxShadow: isFullscreen
                ? "0 8px 40px rgba(0,0,0,0.5)"
                : "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Page
              pageNumber={currentPage}
              scale={scale / 100}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <Box
                  sx={{
                    width: 595 * (scale / 100),
                    height: 842 * (scale / 100),
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "white",
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              }
            />
          </Box>
        </Document>
      </Box>

      {/* Page indicator for fullscreen */}
      {isFullscreen && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "rgba(0,0,0,0.7)",
            color: "white",
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontSize: 13,
          }}
        >
          Page {currentPage} of {numPages}
        </Box>
      )}
    </Box>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "@mui/icons-material";
import { Document, Page, pdfjs } from "react-pdf";
import { auth } from "@/lib/firebase";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Use CDN worker matching installed pdfjs-dist version (5.4.530)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Props = {
  fileHash: string;
};

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

export default function PaperViewerClient({ fileHash }: Props) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setCurrentPage(1);
  }, []);

  const onDocumentLoadError = useCallback((err: Error) => {
    setError(err.message || "Failed to load PDF document");
  }, []);

  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(numPages, p + 1));

  const zoomIn = () => {
    const idx = ZOOM_LEVELS.indexOf(scale);
    if (idx < ZOOM_LEVELS.length - 1) {
      setScale(ZOOM_LEVELS[idx + 1]);
    }
  };

  const zoomOut = () => {
    const idx = ZOOM_LEVELS.indexOf(scale);
    if (idx > 0) {
      setScale(ZOOM_LEVELS[idx - 1]);
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: 520, display: "grid", placeItems: "center", bgcolor: "#fafafa" }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={32} />
          <Typography sx={{ color: "text.secondary" }}>Loading PDF...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !fileUrl) {
    return (
      <Box sx={{ height: 520, display: "grid", placeItems: "center", bgcolor: "#fafafa" }}>
        <Stack alignItems="center" spacing={1}>
          <Typography sx={{ color: "error.main", fontWeight: 500 }}>
            {error || "PDF not available"}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            [PDF Preview - Integrate react-pdf for full functionality]
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          bgcolor: "white",
        }}
      >
        {/* Page Navigation */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton
            size="small"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            sx={{ color: "text.secondary" }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          <Typography sx={{ fontSize: 14, color: "text.primary", minWidth: 100, textAlign: "center" }}>
            Page {currentPage} of {numPages || "..."}
          </Typography>
          <IconButton
            size="small"
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            sx={{ color: "text.secondary" }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Stack>

        {/* Zoom Controls */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton
            size="small"
            onClick={zoomOut}
            disabled={scale <= ZOOM_LEVELS[0]}
            sx={{ color: "text.secondary" }}
          >
            <ZoomOut fontSize="small" />
          </IconButton>
          <Select
            size="small"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            sx={{
              fontSize: 13,
              minWidth: 70,
              "& .MuiSelect-select": { py: 0.5 },
            }}
          >
            {ZOOM_LEVELS.map((z) => (
              <MenuItem key={z} value={z}>
                {z}%
              </MenuItem>
            ))}
          </Select>
          <IconButton
            size="small"
            onClick={zoomIn}
            disabled={scale >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            sx={{ color: "text.secondary" }}
          >
            <ZoomIn fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* PDF Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          bgcolor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          py: 3,
          minHeight: 460,
        }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
              <CircularProgress size={28} />
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                Loading document...
              </Typography>
            </Stack>
          }
        >
          <Box
            sx={{
              bgcolor: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderRadius: 1,
            }}
          >
            <Page
              pageNumber={currentPage}
              scale={scale / 100}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              loading={
                <Box sx={{ width: 595, height: 842, display: "grid", placeItems: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              }
            />
          </Box>
        </Document>
      </Box>
    </Box>
  );
}

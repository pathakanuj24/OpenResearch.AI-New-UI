"use client";

import {
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";

type PaperUploaderProps = {
  file: File | null;
  progress: number;
  error: string | null;
  isLoading: boolean;

  onPick: (file: File) => void;
  onUpload: () => void;
  onClear: () => void;
};

export default function PaperUploader({
  file,
  progress,
  error,
  isLoading,
  onPick,
  onUpload,
  onClear,
}: PaperUploaderProps) {
  return (
    <Box
      sx={{
        border: "1.5px dashed rgba(0,0,0,0.12)",
        borderRadius: 3,
        p: 3,
        bgcolor: "white",
        maxWidth: 520,
      }}
    >
      <Stack spacing={2}>
        {/* Dropzone */}
        <Box
          component="label"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            height: 140,
            borderRadius: 2,
            bgcolor: "rgba(26,115,232,0.06)",
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(26,115,232,0.1)" },
          }}
        >
          <UploadFileRoundedIcon color="primary" sx={{ fontSize: 38 }} />
          <Typography sx={{ fontWeight: 900 }}>
            {file ? file.name : "Click to upload PDF"}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            PDF only · Max size depends on backend
          </Typography>

          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
            }}
          />
        </Box>

        {/* Progress */}
        {isLoading && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 5 }}
            />
            <Typography sx={{ fontSize: 12, mt: 0.5 }}>
              Uploading… {progress}%
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Typography sx={{ color: "error.main", fontSize: 13 }}>
            {error}
          </Typography>
        )}

        {/* Actions */}
        <Stack direction="row" spacing={1.2}>
          <Button
            variant="contained"
            onClick={onUpload}
            disabled={!file || isLoading}
          >
            Analyze Paper
          </Button>

          {file && !isLoading && (
            <Button variant="text" onClick={onClear}>
              Clear
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

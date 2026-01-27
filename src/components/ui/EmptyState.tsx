"use client";

import { memo } from "react";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "minimal" | "illustrated";
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
}: EmptyStateProps) {
  if (variant === "minimal") {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Icon sx={{ fontSize: 40, color: "text.disabled", mb: 2 }} />
        <Typography sx={{ color: "text.secondary", fontWeight: 500 }}>
          {title}
        </Typography>
      </Box>
    );
  }

  if (variant === "illustrated") {
    return (
      <Card
        elevation={0}
        sx={{
          p: 6,
          textAlign: "center",
          border: "none",
          bgcolor: "transparent",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(26,115,232,0.1) 0%, rgba(99,102,241,0.1) 100%)",
              display: "grid",
              placeItems: "center",
              mx: "auto",
              mb: 3,
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "2px dashed rgba(26,115,232,0.2)",
                animation: "spin 20s linear infinite",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            />
            <Icon sx={{ fontSize: 48, color: "primary.main" }} />
          </Box>
        </motion.div>

        <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 1 }}>{title}</Typography>
        <Typography
          sx={{
            color: "text.secondary",
            mb: 4,
            maxWidth: 360,
            mx: "auto",
            lineHeight: 1.7,
          }}
        >
          {description}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          {action && (
            <Button
              variant="contained"
              startIcon={action.icon && <action.icon />}
              onClick={action.onClick}
              sx={{
                borderRadius: 2.5,
                px: 3,
                py: 1.2,
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(26,115,232,0.25)",
              }}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outlined"
              onClick={secondaryAction.onClick}
              sx={{ borderRadius: 2.5, px: 3, py: 1.2, fontWeight: 600, textTransform: "none" }}
            >
              {secondaryAction.label}
            </Button>
          )}
        </Stack>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      elevation={0}
      sx={{
        p: 6,
        textAlign: "center",
        border: "1px dashed rgba(0,0,0,0.12)",
        bgcolor: "rgba(0,0,0,0.01)",
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: 3,
          bgcolor: "rgba(26,115,232,0.08)",
          display: "grid",
          placeItems: "center",
          mx: "auto",
          mb: 2.5,
        }}
      >
        <Icon sx={{ fontSize: 36, color: "primary.main" }} />
      </Box>

      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1 }}>{title}</Typography>
      <Typography
        sx={{
          color: "text.secondary",
          mb: 3,
          maxWidth: 340,
          mx: "auto",
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center">
        {action && (
          <Button
            variant="contained"
            startIcon={action.icon && <action.icon />}
            onClick={action.onClick}
            sx={{ borderRadius: 2.5, fontWeight: 600, textTransform: "none" }}
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button
            variant="outlined"
            onClick={secondaryAction.onClick}
            sx={{ borderRadius: 2.5, fontWeight: 600, textTransform: "none" }}
          >
            {secondaryAction.label}
          </Button>
        )}
      </Stack>
    </Card>
  );
}

export default memo(EmptyState);

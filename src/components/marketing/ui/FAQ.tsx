"use client";

import { useState } from "react";
import { Box, Collapse, Stack, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

export default function FAQ({ items }: { items: { q: string; a: string }[] }) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <Stack spacing={1.5}>
      {items.map((x, idx) => {
        const isOpen = expanded === idx;

        return (
          <Box
            key={x.q}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: isOpen ? "primary.main" : "rgba(0,0,0,0.06)",
              bgcolor: "white",
              overflow: "hidden",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: isOpen ? "primary.main" : "rgba(0,0,0,0.12)",
              },
            }}
          >
            <Box
              onClick={() => setExpanded(isOpen ? null : idx)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2.5,
                cursor: "pointer",
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 16, pr: 2 }}>
                {x.q}
              </Typography>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: isOpen ? "primary.main" : "rgba(0,0,0,0.04)",
                  color: isOpen ? "white" : "text.secondary",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                {isOpen ? (
                  <RemoveRoundedIcon sx={{ fontSize: 18 }} />
                ) : (
                  <AddRoundedIcon sx={{ fontSize: 18 }} />
                )}
              </Box>
            </Box>

            <Collapse in={isOpen}>
              <Box sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                <Typography sx={{ color: "text.secondary", lineHeight: 1.8 }}>
                  {x.a}
                </Typography>
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Stack>
  );
}

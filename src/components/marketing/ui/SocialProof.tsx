"use client";

import { Box, Stack, Typography } from "@mui/material";

export default function SocialProof({ items }: { items: string[] }) {
  return (
    <Box
      sx={{
        mt: 2,
        py: 3,
        borderRadius: 4,
        bgcolor: "rgba(26,115,232,0.04)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Stack spacing={1.2} alignItems="center">
        <Typography sx={{ color: "text.secondary", fontWeight: 800 }}>
          Trusted by students, labs, and teams
        </Typography>

        <Stack
          direction="row"
          spacing={2.5}
          sx={{
            flexWrap: "wrap",
            justifyContent: "center",
            px: 2,
          }}
        >
          {items.map((x) => (
            <Box
              key={x}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 999,
                bgcolor: "white",
                border: "1px solid rgba(0,0,0,0.06)",
                fontWeight: 900,
                color: "text.secondary",
                fontSize: 13,
              }}
            >
              {x}
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

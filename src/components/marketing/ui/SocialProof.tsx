"use client";

import { Box, Stack, Typography } from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import BiotechRoundedIcon from "@mui/icons-material/BiotechRounded";

const icons = [
  SchoolRoundedIcon,
  GroupsRoundedIcon,
  ScienceRoundedIcon,
  PsychologyRoundedIcon,
  BiotechRoundedIcon,
];

export default function SocialProof({ items }: { items: string[] }) {
  return (
    <Box
      sx={{
        mt: 4,
        py: 4,
        px: 3,
        borderRadius: 4,
        bgcolor: "rgba(0,0,0,0.02)",
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Typography
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            fontSize: 14,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Trusted by students, labs, and teams
        </Typography>

        <Stack
          direction="row"
          spacing={{ xs: 2, md: 4 }}
          sx={{
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {items.map((x, idx) => {
            const Icon = icons[idx % icons.length];
            return (
              <Stack
                key={x}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 3,
                  bgcolor: "white",
                  border: "1px solid rgba(0,0,0,0.06)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "rgba(26,115,232,0.2)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  },
                }}
              >
                <Icon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    fontSize: 14,
                  }}
                >
                  {x}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
}

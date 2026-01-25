"use client";

import { Box, Container } from "@mui/material";
import { ReactNode } from "react";

export default function Section({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: any;
}) {
  return (
    <Box sx={{ py: { xs: 6, md: 10 }, ...sx }}>
      <Container maxWidth="lg">{children}</Container>
    </Box>
  );
}

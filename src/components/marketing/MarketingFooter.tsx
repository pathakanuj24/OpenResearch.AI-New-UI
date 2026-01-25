"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import { marketing } from "@/data/marketing";

export default function MarketingFooter() {
  return (
    <Box sx={{ mt: 6, py: 4, borderTop: "1px solid rgba(0,0,0,0.06)", bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
          <Typography sx={{ fontWeight: 900 }}>{marketing.brand}</Typography>
          <Typography sx={{ color: "text.secondary" }}>
            © {new Date().getFullYear()} {marketing.brand}. All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

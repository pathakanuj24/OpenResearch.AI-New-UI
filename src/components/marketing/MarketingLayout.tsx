"use client";

import { Box } from "@mui/material";
import MarketingNavbar from "./MarketingNavbar";
import MarketingFooter from "./MarketingFooter";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <MarketingNavbar />
      {children}
      <MarketingFooter />
    </Box>
  );
}

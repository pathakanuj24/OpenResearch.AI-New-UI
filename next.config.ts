import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: "standalone",
  // Lets a second dev server run beside the main one (e.g. for E2E tests) without sharing .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  turbopack: {},
  // Old dashboard routes → Atlas routes
  async redirects() {
    return [
      { source: "/dashboard", destination: "/today", permanent: false },
      { source: "/dashboard/paper/:id", destination: "/papers/:id", permanent: false },
      { source: "/dashboard/library/:id", destination: "/papers/:id", permanent: false },
      { source: "/dashboard/library", destination: "/today", permanent: false },
      { source: "/dashboard/upload", destination: "/today", permanent: false },
      { source: "/dashboard/learning", destination: "/learning", permanent: false },
      { source: "/dashboard/learn", destination: "/resources", permanent: false },
      { source: "/dashboard/:path*", destination: "/today", permanent: false },
    ];
  },
};

export default nextConfig;

"use client";

import { useQuery } from "@tanstack/react-query";
import { listAnalyses } from "@/lib/api/analysis";

export function useAnalyses(limit = 20, skip = 0) {
  return useQuery({
    queryKey: ["analyses", { limit, skip }],
    queryFn: () => listAnalyses(limit, skip),
    staleTime: 30_000,
  });
}

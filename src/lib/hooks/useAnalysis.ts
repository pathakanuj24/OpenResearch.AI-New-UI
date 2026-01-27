"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalysis } from "@/lib/api/analysis";

export function useAnalysis(file_hash: string) {
  return useQuery({
    queryKey: ["analysis", file_hash],
    queryFn: () => getAnalysis(file_hash),
    enabled: !!file_hash,
    staleTime: 30_000,
  });
}

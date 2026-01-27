"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listAnalyses, AnalysisListItem } from "@/lib/api/analysis";

interface AppData {
  // Papers/Analyses
  papers: AnalysisListItem[];
  totalPapers: number;
  analyzedPapers: number;
  isLoadingPapers: boolean;
  papersError: Error | null;
  refetchPapers: () => void;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const {
    data: analysesData,
    isLoading: isLoadingPapers,
    error: papersError,
    refetch: refetchPapers,
  } = useQuery({
    queryKey: ["analyses", "all"],
    queryFn: () => listAnalyses(100, 0),
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const papers = useMemo(() => analysesData?.analyses || [], [analysesData]);
  const totalPapers = useMemo(() => analysesData?.total || papers.length, [analysesData, papers.length]);
  const analyzedPapers = useMemo(
    () => papers.filter((p) => p.has_analysis).length,
    [papers]
  );

  const value = useMemo(
    () => ({
      papers,
      totalPapers,
      analyzedPapers,
      isLoadingPapers,
      papersError: papersError as Error | null,
      refetchPapers,
    }),
    [papers, totalPapers, analyzedPapers, isLoadingPapers, papersError, refetchPapers]
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
}

// Convenience hooks for specific data
export function usePapers() {
  const { papers, totalPapers, analyzedPapers, isLoadingPapers, papersError, refetchPapers } = useAppData();
  return { papers, totalPapers, analyzedPapers, isLoading: isLoadingPapers, error: papersError, refetch: refetchPapers };
}

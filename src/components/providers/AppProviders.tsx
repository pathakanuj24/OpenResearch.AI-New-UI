"use client";

import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeRegistry from "./ThemeRegistry";
import useAuthInit from "@/lib/auth/useAuthInit";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
    mutations: { retry: 0 },
  },
});

export default function AppProviders({ children }: PropsWithChildren) {
  useAuthInit();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeRegistry>{children}</ThemeRegistry>
    </QueryClientProvider>
  );
}

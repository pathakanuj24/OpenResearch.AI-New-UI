"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import useAuthInit from "@/lib/auth/useAuthInit";
import { ReaderPrefsSync } from "@/lib/prefs";

export default function AppProviders({ children }: PropsWithChildren) {
  useAuthInit();
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
          mutations: { retry: 0 },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {/* Atlas uses data-theme on <html>; "system" follows the OS. */}
      <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider delayDuration={250}>
          <ReaderPrefsSync />
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "var(--ink)",
                color: "var(--bg)",
                border: "0",
                borderRadius: "999px",
                fontFamily: "var(--display)",
                fontWeight: 500,
              },
            }}
          />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

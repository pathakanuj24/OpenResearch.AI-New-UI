"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster, toast } from "sonner";
import { toApiError } from "@/lib/api/errors";
import { installGlobalErrorLogging, logger } from "@/lib/log";
import { TooltipProvider } from "@/components/ui/tooltip";
import useAuthInit from "@/lib/auth/useAuthInit";
import { ReaderPrefsSync } from "@/lib/prefs";

const log = logger("query");

/** Retry only what can succeed on a second try: network, timeouts, 5xx, 429. Never 4xx. */
function retry(failures: number, err: unknown) {
  const e = toApiError(err);
  return e.retryable && failures < 2;
}

function makeClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      // Screens show their own empty/error states; here we only log. 4xx are expected (missing endpoints, 404s).
      onError: (err, query) => {
        const e = toApiError(err);
        if (e.kind === "aborted" || e.isClientError) return;
        log.warn(`Query ${JSON.stringify(query.queryKey).slice(0, 120)} failed`, e, { requestId: e.requestId, status: e.status });
      },
    }),
    mutationCache: new MutationCache({
      // Actions the reader started: say what went wrong unless the mutation handles its own errors.
      onError: (err, _vars, _ctx, mutation) => {
        const e = toApiError(err);
        if (e.kind === "aborted") return;
        if (!e.isClientError) log.error("Action failed", e, { requestId: e.requestId, status: e.status });
        if (!mutation.options.onError && mutation.meta?.silent !== true) toast.error(e.message);
      },
    }),
    defaultOptions: {
      queries: { retry, retryDelay: (n) => Math.min(1000 * 2 ** n, 8000), refetchOnWindowFocus: false, staleTime: 30_000 },
      mutations: { retry: 0 },
    },
  });
}

export default function AppProviders({ children }: PropsWithChildren) {
  useAuthInit();
  const [client] = useState(makeClient);
  useEffect(() => installGlobalErrorLogging(), []);
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

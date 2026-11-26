"use client";

import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import { ApiError, ensureOk, newRequestId, toApiError } from "@/lib/api/errors";
import { logger } from "@/lib/log";

const log = logger("pdf");

/** The paper's PDF bytes, fetched once per paper and shared by the text view, PDF view and page dialog. */
export function usePdfBytes(paperId: string) {
  return useQuery({
    queryKey: ["pdf-bytes", paperId],
    queryFn: async () => {
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = { "X-Request-ID": newRequestId() };
      if (token) headers.Authorization = `Bearer ${token}`;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/papers/${paperId}/pdf`, { headers, signal: AbortSignal.timeout(60_000) });
        if (res.status === 404) throw new ApiError("The PDF for this paper isn't stored on the server.", "http", 404, "not_found", res.headers.get("x-request-id"));
        await ensureOk(res);
        return new Uint8Array(await res.arrayBuffer());
      } catch (err) {
        const e = err instanceof DOMException && err.name === "TimeoutError" ? new ApiError("The PDF took too long to load. Try again.", "timeout") : toApiError(err);
        if (!e.isClientError) log.error("PDF download failed", e, { requestId: e.requestId, status: e.status, paperId });
        throw e;
      }
    },
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    retry: 1,
  });
}

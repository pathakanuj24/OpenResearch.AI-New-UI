"use client";

import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";

/** The paper's PDF bytes, fetched once per paper and shared by the text view, PDF view and page dialog. */
export function usePdfBytes(paperId: string) {
  return useQuery({
    queryKey: ["pdf-bytes", paperId],
    queryFn: async () => {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/papers/${paperId}/pdf`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error(res.status === 404 ? "The PDF for this paper isn't stored on the server." : `Couldn't load the PDF (${res.status}).`);
      return new Uint8Array(await res.arrayBuffer());
    },
    staleTime: Infinity,
    gcTime: 30 * 60_000,
    retry: 1,
  });
}

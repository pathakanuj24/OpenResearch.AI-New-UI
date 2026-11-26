"use client";

import { auth } from "@/lib/firebase";
import { usePrefs } from "@/lib/prefs";

/**
 * Learning-activity events for personalised recommendations (POST /v2/me/events, see docs/frontend-api-contract.md).
 * Batched, flushed every 10 s and when the page is hidden. Nothing is sent when the reader turns off
 * "Use my reading to personalise" in Settings. If the backend doesn't have the endpoint yet, tracking
 * switches itself off for this page load.
 */
export type EventType =
  | "paper_opened" | "read_progress" | "question_asked" | "citation_opened" | "concept_state"
  | "resource_opened" | "resource_saved" | "resource_done" | "resource_hidden" | "trail_stop_opened"
  | "search" | "onboarding_completed";

export type TrackEvent = {
  type: EventType;
  paper_id?: string;
  concept?: string;
  resource_url?: string;
  value?: string | number | boolean | null;
  meta?: Record<string, string | number | boolean | null | undefined>;
};

const queue: (TrackEvent & { at: string })[] = [];
let disabled = false;
let timer: ReturnType<typeof setTimeout> | null = null;

export function track(e: TrackEvent) {
  if (disabled || typeof window === "undefined" || !usePrefs.getState().personalise) return;
  queue.push({ ...e, at: new Date().toISOString() });
  if (queue.length >= 25) void flush();
  else if (!timer) timer = setTimeout(() => void flush(), 10_000);
}

export async function flush(keepalive = false) {
  if (timer) { clearTimeout(timer); timer = null; }
  if (disabled || !queue.length || !auth.currentUser) return;
  const batch = queue.splice(0, queue.length);
  try {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v2/me/events`, {
      method: "POST", keepalive,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ events: batch }),
    });
    if (res.status === 404 || res.status === 405) disabled = true; // endpoint not deployed yet
    else if (!res.ok && res.status >= 500) queue.unshift(...batch.slice(-50)); // retry later, bounded
  } catch {
    queue.unshift(...batch.slice(-50));
  }
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") void flush(true); });
}

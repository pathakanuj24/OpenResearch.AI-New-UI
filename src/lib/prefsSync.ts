"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api/client";
import { useMemory } from "@/lib/data";
import { usePrefs, type ExplainStyle, type Format } from "@/lib/prefs";

/** Server shape for learning-style preferences (extends PUT /v2/me/preferences; see docs/frontend-api-contract.md). */
type ServerPrefs = {
  level?: string | null; explain?: ExplainStyle; session_minutes?: 15 | 30 | 60; formats?: Format[];
  challenge?: "gentle" | "balanced" | "push"; personalise?: boolean;
};

/**
 * Keeps learning-style preferences in the database:
 *  - hydrates the browser store from GET /v2/me/memory when the server returns them;
 *  - writes changes back (debounced) with PUT /v2/me/preferences, alongside field and depth.
 * Until the backend stores these fields it ignores them, and the browser copy is used.
 */
export function PrefsServerSync() {
  const memory = useMemory();
  const hydrated = useRef(false);
  const prefs = usePrefs();

  const data = memory.data;
  useEffect(() => {
    if (hydrated.current || !data) return;
    hydrated.current = true;
    const m = data as typeof data & ServerPrefs;
    const patch: Partial<ReturnType<typeof usePrefs.getState>> = {};
    if (m.level) patch.level = m.level;
    if (m.explain) patch.explain = m.explain;
    if (m.session_minutes) patch.sessionMinutes = m.session_minutes;
    if (m.formats?.length) patch.formats = m.formats;
    if (m.challenge) patch.challenge = m.challenge;
    if (typeof m.personalise === "boolean") patch.personalise = m.personalise;
    if (Object.keys(patch).length) usePrefs.getState().set(patch);
  }, [data]);

  const { level, explain, sessionMinutes, formats, challenge, personalise } = prefs;
  const first = useRef(true);
  useEffect(() => {
    if (!hydrated.current) return;
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => {
      const body: ServerPrefs & { field?: string | null; depth?: string | null } = {
        field: memory.data?.field ?? undefined, depth: memory.data?.depth ?? undefined,
        level, explain, session_minutes: sessionMinutes, formats, challenge, personalise,
      };
      void api.put("/v2/me/preferences", body).catch(() => undefined);
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, explain, sessionMinutes, formats, challenge, personalise]);

  return null;
}

/** Saved / done / hidden resources (PUT /v2/me/resources). Silently skipped until the endpoint exists. */
export function syncResource(r: { url: string; title?: string; kind?: string; source?: string; concept?: string },
  state: "saved" | "done" | "hidden" | "none", reason?: string, paperId?: string) {
  void api.put("/v2/me/resources", { ...r, state, reason, paper_id: paperId }).catch(() => undefined);
}

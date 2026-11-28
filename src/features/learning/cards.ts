"use client";

import { useMemo } from "react";
import type { AtlasResource, ConceptState } from "@/components/atlas";
import { useMap, usePaperResources } from "@/lib/data";
import { orderByPrerequisites } from "@/lib/trail";

/*
 * Concept cards for one paper (or all papers): the reader's state, prerequisite order, what each needs and unlocks,
 * whether it's ready to learn, and its best resource. Used by My learning's Before / Now / After sections and the
 * session plan. (This replaced the drag-and-drop learning board.)
 */

export type BoardPaper = { id: string; title: string; field?: string | null; known: number; total: number };
export type BoardConcept = {
  key: string; name: string; definition?: string | null; state: ConceptState;
  papers: { id: string; title: string; field?: string | null }[];
  verified?: boolean; // passed a "Prove it" check
};
export type Card = BoardConcept & {
  order: number; requires: string[]; unlocks: string[]; locked: string[]; ready: boolean;
  role?: string; resource?: AtlasResource | null; minutes?: number | null; paperId?: string;
};

export const minutesOf = (d?: string | null) => { const m = d?.match(/(\d+)\s*min/); return m ? Number(m[1]) : null; };

/**
 * The cards for one paper (or all papers): prerequisite order, what each needs and unlocks, whether it's ready to
 * learn, and its best resource. Shared by the board and the session plan.
 */
export function useBoardCards(paperId: string | null, all: BoardConcept[], overrides: Record<string, ConceptState>,
  verifiedOverrides: Record<string, boolean> = {}) {
  const map = useMap(paperId ?? undefined);
  const res = usePaperResources(paperId ?? undefined, 6);
  const cards = useMemo<Card[]>(() => {
    const find = (key: string, name: string) => all.find((c) => c.key === key || c.name.toLowerCase() === name.toLowerCase());
    const stateOf = (key: string, name: string, fallback: ConceptState): ConceptState => overrides[key] ?? find(key, name)?.state ?? fallback;
    const verifiedOf = (key: string, name: string) => verifiedOverrides[key] ?? find(key, name)?.verified ?? false;
    if (!paperId) {
      return all.map((c, i) => ({ ...c, state: overrides[c.key] ?? c.state, verified: verifiedOf(c.key, c.name), order: i,
        requires: [], unlocks: [], locked: [], ready: (overrides[c.key] ?? c.state) === "new" }));
    }
    if (!map.data) return [];
    const ordered = orderByPrerequisites(map.data.concepts);
    const byName = new Map(ordered.map((c) => [c.name.toLowerCase(), c]));
    const resources = new Map((res.data ?? []).map((g) => [g.concept.toLowerCase(), g.resources[0] ?? null]));
    const paper = { id: map.data.paper.id, title: map.data.paper.title, field: map.data.paper.field };
    const out = ordered.map((c, i) => {
      const state = stateOf(c.key, c.name, c.status as ConceptState);
      const resource = resources.get(c.name.toLowerCase()) ?? null;
      return {
        key: c.key, name: c.name, definition: c.definition, state, verified: verifiedOf(c.key, c.name),
        papers: [paper], paperId: paper.id, order: i, role: c.role,
        requires: c.requires.filter((r) => byName.has(r.toLowerCase())),
        unlocks: ordered.filter((x) => x.requires.some((r) => r.toLowerCase() === c.name.toLowerCase())).map((x) => x.name),
        locked: [] as string[], ready: false,
        resource: resource ? { ...resource, kind: resource.kind } as AtlasResource : null, minutes: minutesOf(resource?.duration),
      };
    });
    const known = new Set(out.filter((c) => c.state === "known").map((c) => c.name.toLowerCase()));
    for (const c of out) {
      // A lock only matters for concepts still ahead of you.
      c.locked = c.state === "known" ? [] : c.requires.filter((r) => !known.has(r.toLowerCase()));
      c.ready = c.state === "new" && c.locked.length === 0;
    }
    return out;
  }, [paperId, all, overrides, verifiedOverrides, map.data, res.data]);
  return { cards, loading: Boolean(paperId) && map.isLoading, map: map.data ?? null };
}


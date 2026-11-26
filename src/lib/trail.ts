import type { LearningMapData, MapConcept, MapWork } from "@/lib/api/v2";

export type Zone = "before" | "this" | "after";
export type Stop = {
  id: string;
  zone: Zone;
  kind: "concept" | "paper" | "work";
  label: string;
  state: "done" | "current" | "ahead";
  concept?: MapConcept;
  work?: MapWork;
};

/**
 * Trail = Before (prerequisites, deepest first) → This paper (core ideas, then the paper) → After (later work).
 * A concept stop is done when known; the first stop that isn't done is "you are here".
 */
/**
 * Order concepts so every concept comes after what it requires (Kahn's algorithm, stable on the
 * server's order). Cycles, if any, keep their server order at the end.
 */
export function orderByPrerequisites(concepts: MapConcept[]): MapConcept[] {
  const byName = new Map(concepts.map((c) => [c.name.toLowerCase(), c]));
  const indeg = new Map(concepts.map((c) => [c.key, 0]));
  const next = new Map<string, MapConcept[]>();
  for (const c of concepts) {
    for (const r of c.requires) {
      const pre = byName.get(r.toLowerCase());
      if (!pre || pre.key === c.key) continue;
      indeg.set(c.key, (indeg.get(c.key) ?? 0) + 1);
      next.set(pre.key, [...(next.get(pre.key) ?? []), c]);
    }
  }
  const out: MapConcept[] = [];
  const ready = concepts.filter((c) => !indeg.get(c.key));
  while (ready.length) {
    const c = ready.shift()!;
    out.push(c);
    for (const n of next.get(c.key) ?? []) {
      indeg.set(n.key, (indeg.get(n.key) ?? 0) - 1);
      if (!indeg.get(n.key)) ready.push(n);
    }
    ready.sort((a, b) => concepts.indexOf(a) - concepts.indexOf(b));
  }
  return [...out, ...concepts.filter((c) => !out.includes(c))];
}

const normTitle = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Same work listed twice (preprint + published): keep the most-cited copy. */
export function dedupeWorks<T extends { title: string; cited_by?: number | null }>(works: T[]): T[] {
  const best = new Map<string, T>();
  for (const w of works) {
    const k = normTitle(w.title);
    const cur = best.get(k);
    if (!cur || (w.cited_by ?? 0) > (cur.cited_by ?? 0)) best.set(k, w);
  }
  return works.filter((w) => best.get(normTitle(w.title)) === w);
}

export function buildTrail(map: LearningMapData, statusOf?: (c: MapConcept) => MapConcept["status"]): Stop[] {
  const st = (c: MapConcept) => statusOf?.(c) ?? c.status;
  const ordered = orderByPrerequisites(map.concepts);
  // Before = what the paper assumes (prerequisites and anything they require); This paper = what it uses and adds.
  const isBefore = (c: MapConcept) => c.role === "prerequisite";
  const before = ordered.filter(isBefore);
  const core = ordered.filter((c) => !isBefore(c));
  const stops: Stop[] = [
    ...before.map((c) => ({ id: c.key, zone: "before" as const, kind: "concept" as const, label: c.name, state: st(c) === "known" ? "done" as const : "ahead" as const, concept: c })),
    ...core.map((c) => ({ id: c.key, zone: "this" as const, kind: "concept" as const, label: c.name, state: st(c) === "known" ? "done" as const : "ahead" as const, concept: c })),
    { id: `paper:${map.paper.id}`, zone: "this", kind: "paper", label: shortTitle(map.paper.title), state: "ahead" },
    ...dedupeWorks(map.after).slice(0, 3).map((w) => ({ id: `work:${w.id}`, zone: "after" as const, kind: "work" as const, label: `${shortTitle(w.title)}${w.year ? ` (${w.year})` : ""}`, state: "ahead" as const, work: w })),
  ];
  const firstOpen = stops.findIndex((s) => s.state !== "done");
  if (firstOpen >= 0) stops[firstOpen] = { ...stops[firstOpen], state: "current" };
  return stops;
}

/** The concept in your way: first not-known concept whose prerequisites are all known (else the first not-known). */
export function blockingConcept(map: LearningMapData, statusOf?: (c: MapConcept) => MapConcept["status"]): MapConcept | undefined {
  // Same answer as the trail's "you are here": the first concept stop that isn't known.
  return buildTrail(map, statusOf).find((s) => s.kind === "concept" && s.state === "current")?.concept;
}

export function shortTitle(t: string, max = 34) {
  const s = t.split(/[:—–]/)[0].trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + "…" : s;
}

export function unlocks(map: LearningMapData, c: MapConcept): string[] {
  return map.concepts.filter((x) => x.requires.some((r) => r.toLowerCase() === c.name.toLowerCase())).map((x) => x.name);
}

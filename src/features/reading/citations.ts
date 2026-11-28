import type { ResearchMessage, SourceData } from "@/features/chat/types";

/** One place an answer cited the paper: which answer, which pin number, and the source it pointed to. */
export type CitedRef = { n: number; messageId: string; source: SourceData };

/**
 * Every passage the conversation has cited, oldest answer first. The reading column uses it to put a sun pin
 * beside each cited passage, so the link runs both ways: answer → passage, and passage → the answer that cited it.
 */
export function citedRefs(messages: ResearchMessage[]): CitedRef[] {
  const out: CitedRef[] = [];
  for (const m of messages) {
    if (m.role !== "assistant") continue;
    const cites = m.parts.find((p) => p.type === "data-citations")?.data;
    if (!cites) continue;
    for (const n of cites.cited) {
      const source = cites.sources.find((s) => s.index === n);
      if (source) out.push({ n, messageId: m.id, source });
    }
  }
  return out;
}

/** Group refs by a key (passage id or reflow block id); the latest answer's ref comes first in each group. */
export function groupRefs(refs: CitedRef[], keyOf: (r: CitedRef) => string | null): Map<string, CitedRef[]> {
  const m = new Map<string, CitedRef[]>();
  for (const r of refs) {
    const k = keyOf(r);
    if (k) m.set(k, [r, ...(m.get(k) ?? [])]);
  }
  return m;
}

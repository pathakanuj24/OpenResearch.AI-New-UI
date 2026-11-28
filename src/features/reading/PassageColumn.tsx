"use client";

import { Fragment, useEffect } from "react";
import { Check } from "lucide-react";
import { Term, type ConceptState } from "@/components/atlas";
import type { Section } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { CitedRef } from "./citations";
import { MarginPin } from "./MarginPin";

export type PassageTarget = { id: string; nonce: number };

/** Reflowable paper text. Concept terms are marked by the reader's state; cited passages get the highlighter. */
export function PassageColumn({ sections, current, target, cited, conceptState, onConcept, definitions }: {
  sections: Section[]; current: number; target?: PassageTarget | null;
  /** Passage id → the answers that cited it (latest first). */
  cited?: Map<string, CitedRef[]>;
  conceptState: (name: string) => ConceptState; onConcept: (name: string, s: ConceptState) => void;
  definitions: Record<string, string | null | undefined>;
}) {
  useEffect(() => {
    if (!target) return;
    const el = document.getElementById(`p-${target.id}`);
    if (!el) return;
    el.classList.remove("hit");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => el.classList.add("hit"), 450);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <div>
      {sections.map((sec, i) => {
        const state = i < current ? "done" : i === current ? "current" : "ahead";
        return (
          <section key={`${sec.title}-${i}`} id={`s-${i}`} data-section={i} data-section-title={sec.title} className="scroll-mt-28">
            <h2 data-reveal className="mb-3 mt-10 flex items-center gap-2.5 text-[20px] font-semibold tracking-[-0.02em]">
              <span className={cn("grid size-6 place-items-center rounded-lg text-xs font-semibold",
                state === "done" ? "bg-known-soft text-known" : state === "current" ? "bg-moss text-moss-ink" : "bg-surface-2 text-ink-3")}
                aria-label={state === "done" ? "Read" : state === "current" ? "You are here" : "Ahead"}>
                {state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              {sec.title}
            </h2>
            {sec.passages.map((p) => (
              <p key={p.id} id={`p-${p.id}`} data-passage={p.id} data-reveal className="psg reading relative -mx-2 mb-4 px-2 py-1 scroll-mt-32">
                {cited?.get(p.id) ? <MarginPin refs={cited.get(p.id)!} /> : null}
                <TermText text={p.text} names={(p.concepts ?? []).map((c) => c.name)} conceptState={conceptState} onConcept={onConcept} definitions={definitions} />
              </p>
            ))}
          </section>
        );
      })}
    </div>
  );
}

export function TermText({ text, names, conceptState, onConcept, definitions }: {
  text: string; names: string[]; conceptState: (n: string) => ConceptState;
  onConcept: (n: string, s: ConceptState) => void; definitions: Record<string, string | null | undefined>;
}) {
  // Mark the first occurrence of each concept in the passage.
  const hits: { start: number; end: number; name: string }[] = [];
  const lower = text.toLowerCase();
  for (const name of [...names].sort((a, b) => b.length - a.length)) {
    const i = lower.indexOf(name.toLowerCase());
    if (i >= 0 && !hits.some((h) => i < h.end && i + name.length > h.start)) hits.push({ start: i, end: i + name.length, name });
  }
  hits.sort((a, b) => a.start - b.start);
  let pos = 0;
  return (
    <>
      {hits.map((h) => {
        const before = text.slice(pos, h.start);
        pos = h.end;
        return (
          <Fragment key={h.start}>
            {before}
            <Term name={h.name} state={conceptState(h.name)} definition={definitions[h.name.toLowerCase()]} onChange={(s) => onConcept(h.name, s)}>
              {text.slice(h.start, h.end)}
            </Term>
          </Fragment>
        );
      })}
      {text.slice(pos)}
    </>
  );
}

"use client";

import { CitePin } from "@/components/atlas";
import { useGuide } from "@/features/guide/store";
import type { CitedRef } from "./citations";

/**
 * Sun pin beside a passage the guide has cited. Wide screens: in the left margin. Narrow: at the start of the line.
 * Clicking opens the guide on the answer that cited it (the latest one when several did).
 */
export function MarginPin({ refs }: { refs: CitedRef[] }) {
  const showAnswer = useGuide((s) => s.showAnswer);
  const latest = refs[0];
  const answers = new Set(refs.map((r) => r.messageId)).size;
  return (
    <span className="relative mr-1.5 inline-block align-[1px] lg:absolute lg:-left-11 lg:top-1.5 lg:mr-0">
      {/* The pin is 22px; the invisible ::before makes the tap target 44px. */}
      <CitePin n={latest.n} onClick={() => showAnswer(latest.messageId)} className="relative before:absolute before:-inset-[11px] before:content-['']"
        label={`Cited in ${answers === 1 ? "an answer" : `${answers} answers`}. Show ${answers === 1 ? "it" : "the latest"} in Iris`}
        hint={`${latest.source.section ? `${latest.source.section} · ` : ""}p. ${latest.source.page}`} />
      {answers > 1 ? (
        <span aria-hidden className="absolute -right-1.5 -top-1.5 grid min-w-4 place-items-center rounded-pill bg-ink px-1 font-display text-[10px] font-bold leading-4 text-bg">
          {answers}
        </span>
      ) : null}
    </span>
  );
}

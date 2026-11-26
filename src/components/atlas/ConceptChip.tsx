"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ConceptState = "new" | "learning" | "known";

const LABEL: Record<ConceptState, string> = { new: "New to me", learning: "Learning", known: "Known" };
const CHIP: Record<ConceptState, string> = {
  new: "bg-new-soft text-new",
  learning: "bg-learning-soft text-learning",
  known: "bg-known-soft text-known",
};

/** Non-colour cue for each state: dotted ring, half ring, filled check. */
export function StateIcon({ state, className }: { state: ConceptState; className?: string }) {
  if (state === "known") return <span className={cn("grid size-3.5 place-items-center rounded-full bg-current", className)}><Check className="size-2.5 text-surface" strokeWidth={4} /></span>;
  return (
    <svg viewBox="0 0 16 16" className={cn("size-3.5", className)} aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={state === "new" ? "2 2.6" : undefined} />
      {state === "learning" ? <path d="M8 2a6 6 0 0 1 0 12z" fill="currentColor" /> : null}
    </svg>
  );
}

/** Concept chip. Click opens a definition card with the state picker. */
export function ConceptChip({ name, state, definition, requires, onChange, size = "md" }: {
  name: string; state: ConceptState; definition?: string | null; requires?: string[];
  onChange?: (s: ConceptState) => void; size?: "md" | "sm";
}) {
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const pick = (s: ConceptState) => {
    onChange?.(s);
    setBump(true);
    setTimeout(() => setBump(false), 600);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`${name}: ${LABEL[state]}. Open details`}
          className={cn("inline-flex items-center gap-1.5 rounded-pill font-semibold transition-transform duration-[var(--t-med)] ease-spring hover:-translate-y-0.5 hover:scale-[1.04]",
            size === "md" ? "h-[26px] pl-2 pr-[11px] text-[13px]" : "h-[22px] pl-1.5 pr-2 text-xs", CHIP[state], bump && "scale-[1.18]")}>
          <StateIcon state={state} />
          {name}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 rounded-lg border-line bg-surface p-4 shadow-2">
        <p className="text-[15px] font-semibold">{name}</p>
        {definition ? <p className="answer mt-1 text-[15px] text-ink-2">{definition}</p> : null}
        {requires?.length ? <p className="mt-2 text-[13px] text-ink-3">Builds on {requires.join(", ")}</p> : null}
        {onChange ? (
          <div className="mt-3 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="How well do you know this?">
            {(["new", "learning", "known"] as const).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={state === s} onClick={() => pick(s)}
                className={cn("flex h-9 items-center justify-center gap-1.5 rounded-pill text-[13px] font-semibold transition-colors",
                  state === s ? CHIP[s] : "bg-surface-2 text-ink-2 hover:text-ink")}>
                <StateIcon state={s} /> {s === "new" ? "New" : LABEL[s]}
              </button>
            ))}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

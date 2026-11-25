"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StateIcon, type ConceptState } from "./ConceptChip";
import { cn } from "@/lib/utils";

const PICKED: Record<ConceptState, string> = {
  new: "bg-new-soft text-new", learning: "bg-learning-soft text-learning", known: "bg-known-soft text-known",
};

/** A concept term inside reading text: highlighter underline by state; click for definition + state picker. */
export function Term({ children, name, state, definition, onChange }: {
  children: React.ReactNode; name: string; state: ConceptState; definition?: string | null; onChange?: (s: ConceptState) => void;
}) {
  const [open, setOpen] = useState(false);
  const style = state === "known"
    ? { borderBottom: "1.5px dotted var(--ink-3)" }
    : { backgroundImage: `linear-gradient(transparent 62%, var(--${state}-soft) 62%)` };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("rounded-[5px] px-0.5 -mx-0.5 text-left font-[inherit] text-inherit transition-colors", state !== "known" && "hover:bg-[var(--c)]")}
          style={{ ...style, ["--c" as string]: `var(--${state}-soft)` }} aria-label={`${name}: ${state}. Show definition`}>
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 rounded-lg bg-surface p-4 shadow-2">
        <p className="font-display text-[15px] font-semibold">{name}</p>
        {definition ? <p className="answer mt-1 text-[15px] text-ink-2">{definition}</p> : null}
        {onChange ? (
          <div className="mt-3 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="How well do you know this?">
            {(["new", "learning", "known"] as const).map((s) => (
              <button key={s} type="button" role="radio" aria-checked={state === s} onClick={() => { onChange(s); setOpen(false); }}
                className={cn("flex h-9 items-center justify-center gap-1.5 rounded-pill font-display text-[13px] font-semibold",
                  state === s ? PICKED[s] : "bg-surface-2 text-ink-2 hover:text-ink")}>
                <StateIcon state={s} /> {s === "new" ? "New" : s === "learning" ? "Learning" : "Known"}
              </button>
            ))}
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

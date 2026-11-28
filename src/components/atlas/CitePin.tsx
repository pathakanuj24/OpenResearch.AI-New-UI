"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Sun map-pin citation, numbered in order of first use. Click jumps to the passage. */
export function CitePin({ n, onClick, label, quote, hint, className }: {
  n: number; onClick?: () => void; label?: string; quote?: string;
  /** Plain second line for the tooltip (no quote marks), e.g. where the passage is. */
  hint?: string; className?: string;
}) {
  const pin = (
    <button type="button" onClick={onClick} aria-label={label ?? `Source ${n}`}
      className={cn("mx-0.5 inline-grid size-[22px] -rotate-45 place-items-center rounded-[50%_50%_50%_4px] bg-sun align-[2px] font-display text-[11px] font-bold text-sun-ink",
        "animate-pop transition-transform duration-[var(--t-med)] ease-spring hover:-rotate-45 hover:scale-[1.2]", className)}>
      <span className="rotate-45">{n}</span>
    </button>
  );
  if (!quote && !hint) return pin;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{pin}</TooltipTrigger>
      <TooltipContent className="max-w-xs bg-ink text-bg">
        {label ? <p className="font-semibold">{label}</p> : null}
        {quote ? <p className="mt-0.5 font-read opacity-85">“{quote}”</p> : null}
        {hint ? <p className="mt-0.5 opacity-85">{hint}</p> : null}
      </TooltipContent>
    </Tooltip>
  );
}

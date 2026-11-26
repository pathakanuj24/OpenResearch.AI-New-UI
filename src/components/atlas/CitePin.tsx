"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Sun map-pin citation, numbered in order of first use. Click jumps to the passage. */
export function CitePin({ n, onClick, label, quote, className }: {
  n: number; onClick?: () => void; label?: string; quote?: string; className?: string;
}) {
  const pin = (
    <button type="button" onClick={onClick} aria-label={label ?? `Source ${n}`}
      className={cn("mx-0.5 inline-grid size-[22px] -rotate-45 place-items-center rounded-[50%_50%_50%_4px] bg-sun align-[2px] font-display text-[11px] font-bold text-sun-ink",
        "animate-pop transition-transform duration-[var(--t-med)] ease-spring hover:-rotate-45 hover:scale-[1.2]", className)}>
      <span className="rotate-45">{n}</span>
    </button>
  );
  if (!quote) return pin;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{pin}</TooltipTrigger>
      <TooltipContent className="max-w-xs bg-ink text-bg">
        {label ? <p className="font-semibold">{label}</p> : null}
        <p className="mt-0.5 font-read opacity-85">“{quote}”</p>
      </TooltipContent>
    </Tooltip>
  );
}

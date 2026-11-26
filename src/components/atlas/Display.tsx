import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-line bg-surface p-5 shadow-1", className)} {...props} />;
}

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[12.5px] font-semibold tracking-[.02em] text-ink-3", className)} {...props} />;
}

/** Progress ring (e.g. "42% read"). */
export function ProgressRing({ value, size = 22, stroke = 3, color = "var(--moss)", className, label }: {
  value: number; size?: number; stroke?: number; color?: string; className?: string; label?: string;
}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, value));
  return (
    <svg width={size} height={size} className={cn("-rotate-90", className)} role="img" aria-label={label ?? `${Math.round(v * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - v)} style={{ transition: "stroke-dashoffset .8s var(--ease)" }} />
    </svg>
  );
}

export type StepData = { id: string; label: string; status: "running" | "done" | "error"; detail?: string | null; ms?: number };

/** "Show the work": agent steps. */
export function Steps({ steps }: { steps: StepData[] }) {
  return (
    <ol className="flex flex-col gap-1.5">
      {steps.map((s) => (
        <li key={s.id} className={cn("flex items-center gap-2.5 text-[13.5px]",
          s.status === "running" ? "text-ink" : s.status === "error" ? "text-f-psy" : "text-ink-2")}>
          <span className={cn("grid size-[22px] shrink-0 place-items-center rounded-lg",
            s.status === "running" ? "bg-sun-soft" : s.status === "error" ? "bg-surface-2" : "bg-known-soft text-known")}>
            {s.status === "running" ? <span className="size-2 rounded-full bg-sun" style={{ animation: "pulse-dot .9s ease-in-out infinite" }} />
              : s.status === "error" ? <span className="text-xs font-bold">!</span> : <Check className="size-3" strokeWidth={3} />}
          </span>
          <span className="min-w-0 flex-1 truncate">{s.label}</span>
          {s.detail ? <span className="shrink-0 text-xs text-ink-3">{s.detail}</span>
            : s.ms != null && s.status === "done" ? <span className="shrink-0 text-xs text-ink-3">{(s.ms / 1000).toFixed(1)}s</span> : null}
        </li>
      ))}
    </ol>
  );
}

/** Concept passport stamp. */
export function Stamp({ name, sub, state, onClick, className }: {
  name: string; sub?: string; state: "known" | "learning" | "new"; onClick?: () => void; className?: string;
}) {
  const known = state === "known", learning = state === "learning";
  return (
    <button type="button" onClick={onClick} aria-label={`${name}: ${known ? "known" : learning ? "learning" : "new to me"}. Change`}
      className={cn("relative inline-flex aspect-square w-[150px] flex-col items-center justify-center rounded-full p-6 text-center font-display text-[13px] font-bold leading-tight",
        "transition-transform duration-[var(--t-med)] ease-spring hover:scale-105",
        known ? "-rotate-6 text-known" : learning ? "text-learning" : "text-ink-3", className)}
      style={known ? { animation: "ink-in .6s var(--spring) both" } : undefined}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden
        style={learning ? { animation: "spin-slow 40s linear infinite" } : undefined}>
        {state !== "new" ? <circle cx="50" cy="50" r="47" fill={known ? "var(--known-soft)" : "var(--learning-soft)"} /> : null}
        <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth={known ? 3.5 : 2.5}
          strokeDasharray={learning ? "6 6" : state === "new" ? "2 6" : undefined} strokeLinecap="round" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" opacity=".5" />
      </svg>
      <span className="relative">{name}</span>
      <small className="relative mt-1 text-[10.5px] uppercase tracking-[.08em] opacity-75">{sub ?? (known ? "Known" : learning ? "Learning" : "New to me")}</small>
      {known ? <svg viewBox="0 0 40 12" className="relative mt-1 w-9 opacity-60" aria-hidden><path d="M2 10 L20 2 L38 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg> : null}
    </button>
  );
}

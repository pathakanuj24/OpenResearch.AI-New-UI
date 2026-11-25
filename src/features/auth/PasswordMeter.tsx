import { cn } from "@/lib/utils";

const RULES: [string, (s: string) => boolean][] = [
  ["8+ characters", (s) => s.length >= 8],
  ["Upper and lower case", (s) => /[a-z]/.test(s) && /[A-Z]/.test(s)],
  ["A number", (s) => /\d/.test(s)],
  ["A symbol", (s) => /[^A-Za-z0-9]/.test(s)],
];

export const passwordOk = (s: string) => RULES.slice(0, 3).every(([, f]) => f(s));

/** Strength meter + checklist (sign-up and change-password only). */
export function PasswordMeter({ value }: { value: string }) {
  const score = RULES.filter(([, f]) => f(value)).length;
  const color = ["", "bg-f-psy", "bg-learning", "bg-f-earth", "bg-known"][score];
  return (
    <div aria-live="polite">
      <div className="grid grid-cols-4 gap-1" aria-hidden>{[1, 2, 3, 4].map((i) => <i key={i} className={cn("h-[5px] rounded-[5px]", i <= score ? color : "bg-surface-2")} />)}</div>
      <ul className="mt-1.5 grid grid-cols-2 gap-1 text-[12.5px]">
        {RULES.map(([label, f]) => <li key={label} className={f(value) ? "text-known" : "text-ink-3"}>{f(value) ? "✓" : "○"} {label}</li>)}
      </ul>
    </div>
  );
}

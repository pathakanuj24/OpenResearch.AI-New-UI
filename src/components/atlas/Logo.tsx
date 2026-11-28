import Link from "next/link";
import { cn } from "@/lib/utils";

/** The i-way: a lowercase i whose stem bends into a road. The dot is the insight, lit in sun. */
export function LogoMark({ tone = "moss", className }: { tone?: "moss" | "sun"; className?: string }) {
  return (
    <span className={cn("grid size-[34px] place-items-center rounded-[11px]",
      tone === "moss" ? "bg-moss text-moss-ink" : "bg-sun text-sun-ink", className)} aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="4.6" r="2.1" stroke="none" fill={tone === "moss" ? "var(--sun)" : "currentColor"} />
        <path d="M7.5 9.5v5c0 3.2 1.8 5 5 5H20" />
        <path d="M17.2 16.6 20 19.5l-2.8 2.9" />
      </svg>
    </span>
  );
}

export function Logo({ href = "/", tone, light }: { href?: string; tone?: "moss" | "sun"; light?: boolean }) {
  return (
    <Link href={href} aria-label="Insightway home" className="flex items-center gap-2.5 rounded-lg">
      <LogoMark tone={tone} />
      <span className={cn("text-[18px] font-semibold tracking-[-0.02em]", light ? "text-moss-ink" : "text-ink")}>
        insight<span className={light ? undefined : "text-moss-text"}>way</span>
      </span>
    </Link>
  );
}

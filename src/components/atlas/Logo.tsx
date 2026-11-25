import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ tone = "moss", className }: { tone?: "moss" | "sun"; className?: string }) {
  return (
    <span className={cn("grid size-[34px] place-items-center rounded-[11px]",
      tone === "moss" ? "bg-moss text-moss-ink" : "bg-sun text-sun-ink", className)} aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M4 19c3-1 4-5 7-6s5 1 9-7" />
        <circle cx="4" cy="19" r="1.7" fill="currentColor" />
        <circle cx="20" cy="6" r="1.7" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Logo({ href = "/", tone, light }: { href?: string; tone?: "moss" | "sun"; light?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 rounded-lg">
      <LogoMark tone={tone} />
      <span className={cn("text-[18px] font-semibold tracking-[-0.02em]", light ? "text-moss-ink" : "text-ink")}>OpenResearch</span>
    </Link>
  );
}

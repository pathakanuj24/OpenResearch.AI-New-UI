"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { BookOpen, GraduationCap, House, Moon, Route, Search, Sparkles, Sun, Upload } from "lucide-react";
import { Logo } from "@/components/atlas";
import { useJobPolling, useLastPaper, useUpload } from "@/lib/data";
import { useGuide } from "@/features/guide/store";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./AccountMenu";
import { CommandPalette } from "./CommandPalette";
import { Onboarding } from "@/features/onboarding/Onboarding";
import { PrefsServerSync } from "@/lib/prefsSync";
import { APP_NAV, activeNav } from "./nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [palette, setPalette] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const upload = useUpload();
  const last = useLastPaper((s) => s.id);
  useJobPolling();

  const startUpload = useCallback(async (file?: File | null) => {
    if (!file) return;
    const id = await upload(file);
    if (id) router.push(`/papers/${id}`);
  }, [upload, router]);

  // Drop a PDF anywhere on an app page.
  useEffect(() => {
    let depth = 0;
    const hasFile = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const enter = (e: DragEvent) => { if (hasFile(e)) { depth++; setDragging(true); } };
    const leave = () => { depth = Math.max(0, depth - 1); if (!depth) setDragging(false); };
    const over = (e: DragEvent) => { if (hasFile(e)) e.preventDefault(); };
    const drop = (e: DragEvent) => {
      if (!hasFile(e)) return;
      e.preventDefault(); depth = 0; setDragging(false);
      void startUpload(e.dataTransfer?.files?.[0]);
    };
    window.addEventListener("dragenter", enter); window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", over); window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter); window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", over); window.removeEventListener("drop", drop);
    };
  }, [startUpload]);

  const chooseFile = () => fileInput.current?.click();

  return (
    <div className="min-h-dvh bg-bg">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2 focus:shadow-2">
        Skip to content
      </a>
      <input ref={fileInput} type="file" accept="application/pdf" className="hidden" aria-hidden
        onChange={(e) => { void startUpload(e.target.files?.[0]); e.target.value = ""; }} />

      <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 md:px-6">
          <Logo href="/today" />
          <NavPill pathname={pathname} lastPaper={last} />
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setPalette(true)}
              className="flex h-10 items-center gap-2.5 rounded-pill border border-line bg-surface pl-3.5 pr-2 text-sm text-ink-2 shadow-1 transition-colors hover:border-line-2 md:w-[316px]">
              <Search className="size-4" aria-hidden />
              <span className="hidden flex-1 text-left md:inline">Search papers, concepts, or ask</span>
              <kbd className="hidden rounded-md bg-surface-2 px-1.5 py-0.5 font-display text-[11px] font-semibold text-ink-2 md:inline">⌘K</kbd>
            </button>
            <button type="button" onClick={chooseFile} aria-label="Add a paper"
              className="hidden size-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink sm:grid">
              <Upload className="size-[18px]" />
            </button>
            <ThemeButton />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main id="main" className="pb-28 md:pb-10">{children}</main>

      <MobileBar pathname={pathname} lastPaper={last} />
      <CommandPalette open={palette} onOpenChange={setPalette} onUpload={chooseFile} />
      <Onboarding />
      <PrefsServerSync />

      {dragging ? (
        <div className="pointer-events-none fixed inset-0 z-[70] grid place-items-center bg-moss/20 backdrop-blur-[2px]">
          <div className="rounded-2xl border-2 border-dashed border-moss bg-surface px-10 py-8 text-center shadow-2 animate-pop">
            <p className="text-xl font-semibold">Drop your PDF to map it</p>
            <p className="mt-1 text-sm text-ink-2">Any field · text PDFs · up to 50 MB</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NavPill({ pathname, lastPaper }: { pathname: string; lastPaper?: string }) {
  const active = activeNav(pathname);
  const ref = useRef<HTMLElement>(null);
  const blob = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current?.querySelector<HTMLAnchorElement>(`[data-key="${active}"]`);
    if (!blob.current) return;
    blob.current.style.opacity = el ? "1" : "0";
    if (el) { blob.current.style.left = `${el.offsetLeft}px`; blob.current.style.width = `${el.offsetWidth}px`; }
  }, [active]);
  return (
    <nav ref={ref} aria-label="Main" className="relative hidden items-center gap-0.5 rounded-pill bg-surface-2 p-1 md:flex">
      <span ref={blob} aria-hidden className="absolute top-1 bottom-1 rounded-pill bg-surface opacity-0 shadow-1 transition-[left,width,opacity] duration-[450ms] ease-spring" />
      {APP_NAV.map((n) => {
        const href = n.key === "reading" ? (lastPaper ? `/papers/${lastPaper}` : "/today") : n.href;
        return (
          <Link key={n.key} href={href} data-key={n.key} aria-current={active === n.key ? "page" : undefined}
            className={cn("relative z-[1] rounded-pill px-4 py-1.5 text-[15px] font-medium transition-colors",
              active === n.key ? "text-ink" : "text-ink-2 hover:text-ink")}>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <button type="button" onClick={() => setTheme(dark ? "light" : "dark")} aria-label="Switch light or dark theme"
      className="grid size-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
      <Sun className="hidden size-[18px] dark:block" aria-hidden /><Moon className="size-[18px] dark:hidden" aria-hidden />
    </button>
  );
}

/** Mobile: floating bottom bar — Today, Read, Ask (centre, moss), Trail, Learning. */
function MobileBar({ pathname, lastPaper }: { pathname: string; lastPaper?: string }) {
  const router = useRouter();
  const ask = useGuide((s) => s.setOpen);
  const active = activeNav(pathname);
  const paperHref = lastPaper ? `/papers/${lastPaper}` : "/today";
  const item = "flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[11px] font-semibold";
  return (
    <nav aria-label="Main" className="fixed inset-x-3 bottom-3 z-40 flex items-center rounded-[22px] border border-line bg-surface/95 px-1.5 py-1 shadow-2 backdrop-blur md:hidden">
      <Link href="/today" className={cn(item, active === "today" ? "text-moss-text" : "text-ink-3")}><House className="size-5" />Today</Link>
      <Link href={paperHref} className={cn(item, active === "reading" && !pathname.includes("view=trail") ? "text-moss-text" : "text-ink-3")}><BookOpen className="size-5" />Read</Link>
      <button type="button" aria-label="Ask the guide" onClick={() => { if (!pathname.startsWith("/papers")) router.push(`${paperHref}?guide=1`); ask(true); }}
        className="mx-1 grid size-12 -translate-y-3 place-items-center rounded-full bg-moss text-moss-ink shadow-2">
        <Sparkles className="size-5" />
      </button>
      <Link href={lastPaper ? `/papers/${lastPaper}?view=trail` : "/today"} className={cn(item, "text-ink-3")}><Route className="size-5" />Trail</Link>
      <Link href="/learning" className={cn(item, active === "learning" ? "text-moss-text" : "text-ink-3")}><GraduationCap className="size-5" />Learning</Link>
    </nav>
  );
}

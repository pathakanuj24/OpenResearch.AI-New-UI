"use client";

import { ArrowRight, BookOpen, Check, FileText, GraduationCap, MapPin, MousePointerClick, Play, SlidersHorizontal, Sparkles } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Topo } from "./Topo";
import { cn } from "@/lib/utils";

export type ResourceKind = "video" | "article" | "interactive" | "course" | "paper";
export type AtlasResource = {
  url: string; title: string; kind: ResourceKind | string; source: string; why?: string | null;
  duration?: string | null; concept?: string; difficulty?: number | null;
  image?: string | null; // preview image (og:image) when the backend provides one
};

/** A real image for the card: YouTube thumbnail, else the backend's preview image. */
export function resourceImage(r: AtlasResource): string | null {
  if (r.image) return r.image;
  try {
    const u = new URL(r.url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    const id = host === "youtu.be" ? u.pathname.slice(1) : host === "youtube.com" ? u.searchParams.get("v") : null;
    if (id && /^[\w-]{6,}$/.test(id)) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  } catch { /* not a URL */ }
  return null;
}

function hostOf(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
}

export const KIND: Record<ResourceKind, { label: string; color: string; icon: typeof Play }> = {
  video: { label: "Video", color: "var(--f-psy)", icon: Play },
  article: { label: "Article", color: "var(--f-earth)", icon: FileText },
  interactive: { label: "Interactive", color: "var(--f-law)", icon: MousePointerClick },
  course: { label: "Course", color: "var(--f-phys)", icon: GraduationCap },
  paper: { label: "Paper", color: "var(--f-hist)", icon: BookOpen },
};

export const kindOf = (k: string): ResourceKind => (k in KIND ? (k as ResourceKind) : "article");

export function Difficulty({ level, target }: { level: number; target?: number }) {
  const gap = target == null ? 0 : level - target;
  const tone = gap >= 2 ? "stretch" : gap <= -2 ? "review" : "fit";
  const color = tone === "fit" ? "var(--known)" : tone === "stretch" ? "var(--learning)" : "var(--new)";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
      <span className="flex gap-0.5" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => <i key={i} className="size-[7px] rounded-[2px]" style={{ background: i <= level ? color : "var(--line-2)" }} />)}
      </span>
      {tone === "fit" ? "At your level" : tone === "stretch" ? "Stretch" : "Review"}
    </span>
  );
}

export function ResourceCard({ r, saved, done, onSave, onDone, onHide, onOpen, conceptChip, className }: {
  r: AtlasResource; saved?: boolean; done?: boolean; onSave?: () => void; onDone?: () => void; onOpen?: () => void;
  onHide?: (reason: "easy" | "hard" | "useless") => void; conceptChip?: React.ReactNode; className?: string;
}) {
  const k = KIND[kindOf(r.kind)];
  const Icon = k.icon;
  const self = useRef<HTMLElement>(null);
  // Rise in once, the first time the card scrolls into view. Set before paint so an in-view card never flashes;
  // without IntersectionObserver (or JS) the card simply stays visible.
  useLayoutEffect(() => {
    const el = self.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    el.setAttribute("data-pending", "");
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.removeAttribute("data-pending");
      el.setAttribute("data-in", "");
      io.disconnect();
    }, { rootMargin: "0px 0px 60px 0px" }); // start just before the card enters, so no empty gap shows
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const img = resourceImage(r);
  const host = hostOf(r.url);
  return (
    <article ref={self} className={cn("card-in group/card flex flex-col overflow-hidden rounded-[var(--r-lg)] border border-line bg-surface shadow-1",
      "transition-[translate,box-shadow,opacity,border-color] duration-[var(--t-med)] ease-spring hover:-translate-y-1 hover:border-line-2 hover:shadow-2",
      "focus-within:-translate-y-1 focus-within:shadow-2", done && "opacity-70", className)}>
      <div className="relative flex h-[132px] items-end justify-between overflow-hidden px-3 pb-2.5 text-[#fff]" style={{ background: k.color }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" loading="lazy" referrerPolicy="no-referrer"
            className="absolute inset-0 size-full object-cover transition-transform duration-[var(--t-slow)] ease-atlas group-hover/card:scale-105"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        ) : (
          <>
            <Topo seed={r.url} className="absolute inset-0 size-full" stroke="#fff" opacity={0.35} rings={7} centers={2} />
            {host && kindOf(r.kind) === "article" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`https://${host}/favicon.ico`} alt="" referrerPolicy="no-referrer" className="absolute left-3 top-3 size-8 rounded-[8px] bg-[#fff] p-1 shadow-1"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : null}
          </>
        )}
        <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.55),rgba(0,0,0,0)_60%)]" aria-hidden />
        {/* A soft light sweeps across the cover on hover. */}
        <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_35%,rgba(255,255,255,.28)_50%,transparent_65%)] transition-transform duration-700 ease-atlas group-hover/card:translate-x-full" />
        {img && kindOf(r.kind) === "video" ? (
          <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 backdrop-blur-sm transition-transform duration-[var(--t-med)] ease-spring group-hover/card:scale-110" aria-hidden>
            <Play className="ml-0.5 size-5" fill="currentColor" />
          </span>
        ) : null}
        <span className="relative inline-flex items-center gap-1 rounded-pill bg-black/45 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm transition-transform duration-[var(--t-med)] ease-spring group-hover/card:-translate-y-0.5"><Icon className="size-3" /> {k.label}</span>
        {r.duration ? <span className="relative rounded-pill bg-black/45 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">{r.duration}</span> : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3">
        <h4 className="text-[15.5px] font-semibold leading-snug">
          <a href={r.url} target="_blank" rel="noopener noreferrer" onClick={onOpen} className="hover:underline">{r.title}</a>
        </h4>
        <span className="text-[12.5px] text-ink-3">{r.source}</span>
        <div className="flex flex-wrap items-center gap-2">
          {r.difficulty ? <Difficulty level={r.difficulty} /> : null}
          {conceptChip}
        </div>
        {r.why ? (
          <p className="mt-0.5 flex gap-1.5 rounded-[10px] bg-surface-2 px-2.5 py-2 text-[13px] text-ink-2">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-moss-text" aria-hidden /> {r.why}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-1.5 border-t border-line px-2.5 py-2">
        <a href={r.url} target="_blank" rel="noopener noreferrer" onClick={onOpen}
          className="group/start inline-flex h-8 items-center gap-1 rounded-pill bg-moss pl-3.5 pr-3 text-[13px] font-semibold text-moss-ink transition-[transform,box-shadow] duration-[var(--t-med)] ease-spring hover:-translate-y-0.5 hover:shadow-2 active:scale-[.96]">
          Start
          <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-[transform,opacity] duration-[var(--t-med)] ease-spring group-hover/card:translate-x-0 group-hover/card:opacity-100" aria-hidden />
        </a>
        {onSave ? <IconAction label={saved ? "Saved. Remove from queue" : "Save for later"} pressed={saved} onClick={onSave}><MapPin /></IconAction> : null}
        {onDone ? <IconAction label={done ? "Done. Mark not done" : "Mark done"} pressed={done} onClick={onDone}><Check /></IconAction> : null}
        {onHide ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="ml-auto inline-flex h-8 items-center gap-1 rounded-pill px-2.5 text-[13px] font-semibold text-ink-2 hover:bg-surface-2">
                <SlidersHorizontal className="size-3.5" /> Tune
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-lg">
              <DropdownMenuItem onSelect={() => onHide("easy")}>Too easy</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onHide("hard")}>Too hard</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onHide("useless")}>Not useful</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </article>
  );
}

/** Save / Done toggle. Turning it on pops the icon and sends a ripple out from the button. */
function IconAction({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} aria-pressed={pressed} onClick={onClick}
      className={cn("relative grid size-8 place-items-center rounded-full transition-colors active:scale-90 [&_svg]:size-4",
        pressed ? "bg-moss-soft text-moss-text" : "text-ink-2 hover:bg-surface-2 hover:text-ink")}>
      {pressed ? <span key="ripple" aria-hidden className="absolute inset-0 rounded-full border-2 border-moss animate-ripple" /> : null}
      {/* Re-keyed on change so the icon replays its pop each time it's switched on. */}
      <span key={String(pressed)} className={cn("grid place-items-center", pressed && "animate-celebrate")}>{children}</span>
    </button>
  );
}

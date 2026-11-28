"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ListTree } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SectionInfo = { index: number; title: string };

// Headings rebuilt from a PDF sometimes run into the text beside them ("Introduction ent levels of abstraction…").
// When a heading starts with a standard section name, the outline shows just that name.
const STANDARD = /^((?:\d+(?:\.\d+)*\.?\s*)?(?:abstract|introduction|background|preliminaries|related work|methods?|methodology|approach|experiments?|results?|evaluation|discussion|limitations?|conclusions?|future work|references|bibliography|appendix|acknowledge?ments?))\b/i;
export function outlineTitle(raw: string) {
  const t = raw.replace(/\s+/g, " ").trim();
  const m = t.match(STANDARD);
  return m && t.length > m[1].length + 2 ? m[1] : t;
}

/**
 * The sections the reading column has rendered, read from its `data-section-title` headings. Works for both the
 * passage view and the text rebuilt from the PDF (which renders later), so it watches the column for changes.
 */
export function useSections(column: React.RefObject<HTMLElement | null>, key: unknown) {
  const [list, setList] = useState<SectionInfo[]>([]);
  useEffect(() => {
    const el = column.current;
    if (!el) return;
    let raf = 0;
    const scan = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = Array.from(el.querySelectorAll<HTMLElement>("[data-section-title]"))
          .map((h) => ({ index: Number(h.dataset.section), title: outlineTitle(h.dataset.sectionTitle ?? "") || "Untitled section" }));
        setList((prev) => (prev.length === next.length && prev.every((p, i) => p.title === next[i].title) ? prev : next));
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(el, { childList: true, subtree: true });
    return () => { mo.disconnect(); cancelAnimationFrame(raf); };
  }, [column, key]);
  return list;
}

export function goToSection(column: React.RefObject<HTMLElement | null>, index: number) {
  column.current?.querySelector<HTMLElement>(`[data-section="${index}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Contents list with a sun "you are here" marker that slides between sections and a moss bar for what's read. */
export function SectionList({ sections, current, onGo }: { sections: SectionInfo[]; current: number; onGo: (index: number) => void }) {
  const list = useRef<HTMLOListElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const read = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const li = list.current?.querySelectorAll<HTMLElement>(":scope > li")[Math.min(current, sections.length - 1)];
    if (!li || !marker.current || !read.current) return;
    marker.current.style.transform = `translateY(${li.offsetTop}px)`;
    marker.current.style.height = `${li.offsetHeight}px`;
    marker.current.style.opacity = "1";
    read.current.style.transform = `scaleY(${li.offsetTop / Math.max(1, list.current!.offsetHeight)})`;
  }, [current, sections]);
  return (
    <ol ref={list} className="relative border-l-2 border-line">
      <span ref={read} aria-hidden className="absolute -left-[2px] top-0 h-full w-[2px] origin-top scale-y-0 bg-moss transition-transform duration-[var(--t-slow)] ease-atlas" />
      <span ref={marker} aria-hidden className="absolute -left-[2px] top-0 w-[2px] rounded-pill bg-sun opacity-0 transition-[transform,height] duration-[450ms] ease-atlas" />
      {sections.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "ahead";
        return (
          <li key={`${s.index}-${s.title}`}>
            <button type="button" onClick={() => onGo(s.index)} aria-current={state === "current" ? "location" : undefined}
              className={cn("flex w-full items-start gap-2 rounded-r-[var(--r-xs)] py-1.5 pl-3.5 pr-2 text-left text-[13px] leading-snug transition-colors hover:bg-surface-2",
                state === "current" ? "font-semibold text-ink" : state === "done" ? "text-ink-2" : "text-ink-3 hover:text-ink-2")}>
              <span className="line-clamp-2 flex-1">{s.title}</span>
              {state === "done" ? <Check className="mt-0.5 size-3.5 shrink-0 text-known" strokeWidth={3} aria-label="Read" /> : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Rail in the left margin beside the reading column (wide screens, guide closed). */
export function SectionRail({ sections, current, onGo }: { sections: SectionInfo[]; current: number; onGo: (index: number) => void }) {
  if (sections.length < 2) return null;
  return (
    <nav aria-label="Sections of this paper" className="max-h-[calc(100dvh-180px)] overflow-y-auto pb-6 animate-enter">
      <p className="mb-3 text-[12.5px] font-semibold text-ink-3">Contents · {Math.min(current + 1, sections.length)} of {sections.length}</p>
      <SectionList sections={sections} current={current} onGo={onGo} />
    </nav>
  );
}

/** Toolbar button that opens the same list (when the rail has no room, and on phones). */
export function SectionMenu({ sections, current, onGo, className }: {
  sections: SectionInfo[]; current: number; onGo: (index: number) => void; className?: string;
}) {
  const [open, setOpen] = useState(false);
  if (sections.length < 2) return null;
  const here = sections[Math.min(current, sections.length - 1)];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Sections. You are in ${here.title}`}
          className={cn("inline-flex h-9 min-w-0 items-center gap-2 rounded-pill px-3 text-[13.5px] font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink", className)}>
          <ListTree className="size-4 shrink-0" aria-hidden />
          <span className="hidden max-w-[200px] truncate lg:inline">{here.title}</span>
          <span className="tabular-nums text-ink-3">{Math.min(current + 1, sections.length)}/{sections.length}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-[60vh] w-72 overflow-y-auto rounded-[var(--r)] bg-surface p-3 shadow-2">
        <p className="mb-2 pl-1 text-[12.5px] font-semibold text-ink-3">Sections of this paper</p>
        <SectionList sections={sections} current={current} onGo={(i) => { setOpen(false); onGo(i); }} />
      </PopoverContent>
    </Popover>
  );
}

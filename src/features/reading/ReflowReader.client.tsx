"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import { Check, Copy, FileText, Loader2, Maximize2, MessageCircleQuestion, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ConceptState } from "@/components/atlas";
import { cn } from "@/lib/utils";
import { findBlock, reflow, type Block, type PageText } from "./reflow";
import { TermText } from "./PassageColumn";
import { usePdfBytes } from "./usePdf";
import { logger } from "@/lib/log";
import { groupRefs, type CitedRef } from "./citations";
import { MarginPin } from "./MarginPin";

const log = logger("reflow");

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type ReflowTarget = { page: number; quote?: string; nonce: number };

const cache = new Map<string, Block[]>();

async function extract(data: Uint8Array): Promise<Block[]> {
  const doc = await pdfjs.getDocument({ data: data.slice() }).promise;
  const pages: PageText[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const vp = page.getViewport({ scale: 1 });
    const tc = await page.getTextContent();
    pages.push({
      page: i, width: vp.width, height: vp.height,
      items: tc.items.flatMap((it) => ("str" in it ? [{
        str: it.str, x: it.transform[4], y: it.transform[5], w: it.width,
        h: Math.abs(it.height || Math.hypot(it.transform[2], it.transform[3])),
        bold: /bold|black|heavy|semibold/i.test(it.fontName + " " + (tc.styles[it.fontName]?.fontFamily ?? "")),
      }] : [])),
    });
  }
  await doc.destroy();
  return reflow(pages);
}

/**
 * The paper as calm, interactive reading text, rebuilt in the browser from the PDF:
 * headings with progress badges, concept terms by state, figures on demand, select-to-ask,
 * and citations that sweep a highlighter over the exact paragraph.
 */
export default function ReflowReader({ paperId, target, current, cited, conceptNames, conceptState, onConcept, definitions, onAsk }: {
  paperId: string; target?: ReflowTarget | null; current: number; cited?: CitedRef[]; conceptNames: string[];
  conceptState: (n: string) => ConceptState; onConcept: (n: string, s: ConceptState) => void;
  definitions: Record<string, string | null | undefined>; onAsk: (q: string) => void;
}) {
  const pdf = usePdfBytes(paperId);
  const [blocks, setBlocks] = useState<Block[] | null>(cache.get(paperId) ?? null);
  const [failed, setFailed] = useState(false);
  const [pageView, setPageView] = useState<number | null>(null);
  // pdf.js takes ownership of the buffer it's given: a fresh copy each time the dialog opens, stable while it's open.
  const dialogOpen = pageView !== null;
  const pageFile = useMemo(() => (pdf.data && dialogOpen ? { data: pdf.data.slice() } : null), [pdf.data, dialogOpen]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pdf.data || cache.has(paperId)) return;
    let alive = true;
    extract(pdf.data).then((b) => { cache.set(paperId, b); if (alive) setBlocks(b); }).catch((err) => {
      log.error("Text extraction failed; falling back to the PDF view", err, { paperId });
      if (alive) setFailed(true);
    });
    return () => { alive = false; };
  }, [pdf.data, paperId]);

  // Citation: find the paragraph, centre it, sweep the highlighter.
  useEffect(() => {
    if (!target || !blocks) return;
    const id = target.quote ? findBlock(blocks, target.quote, target.page) : null;
    const el = id ? document.getElementById(`rf-${id}`) : box.current?.querySelector<HTMLElement>(`[data-page="${target.page}"]`);
    if (!el) return;
    el.classList.remove("hit");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => el.classList.add("hit"), 450);
    return () => clearTimeout(t);
  }, [target, blocks]);

  // Section index for each heading (progress badges).
  const sections = useMemo(() => {
    let i = -1;
    return (blocks ?? []).map((b) => (b.kind === "heading" && b.level === 1 ? ++i : i));
  }, [blocks]);
  // Cited quotes → the paragraphs they came from, so those paragraphs carry a pin back to the answer.
  const citedBlocks = useMemo(
    () => (blocks && cited?.length ? groupRefs(cited, (r) => findBlock(blocks, r.source.quote, r.source.page)) : null),
    [blocks, cited],
  );
  const refsAt = useMemo(() => (blocks ?? []).findIndex((b) => b.kind === "heading" && /^(\d+\.?\s*)?(references|bibliography)\b/i.test(b.text)), [blocks]);

  if (pdf.error) return <p className="rounded-[14px] bg-surface-2 p-4 text-sm text-ink-2">{(pdf.error as Error).message}</p>;
  if (failed) return <p className="rounded-[14px] bg-surface-2 p-4 text-sm text-ink-2">We couldn&apos;t turn this PDF into text. Switch to the PDF view above.</p>;
  if (!blocks) {
    return (
      <div className="flex items-center gap-3 py-10 text-ink-3" role="status">
        <Loader2 className="size-5 animate-spin" /> Preparing the reading view…
      </div>
    );
  }
  if (!blocks.some((b) => b.kind === "para")) {
    return <p className="rounded-[14px] bg-surface-2 p-4 text-sm text-ink-2">This PDF has no readable text layer (it may be scanned). Switch to the PDF view above.</p>;
  }

  return (
    <div ref={box} className="relative">
      <SelectionMenu container={box} onAsk={onAsk} />
      {blocks.map((b, i) => {
        if (refsAt >= 0 && i > refsAt) {
          return b.kind === "para" ? <p key={i} className="mb-2 pl-2 font-read text-[14.5px] leading-relaxed text-ink-2">{b.text}</p> : null;
        }
        if (b.kind === "heading") {
          const idx = sections[i];
          const state = idx < current ? "done" : idx === current ? "current" : "ahead";
          return b.level === 1 ? (
            <h2 key={i} data-reveal data-section={idx} data-section-title={b.text} data-page={b.page} className="mb-3 mt-10 flex scroll-mt-28 items-center gap-2.5 text-[21px] font-semibold tracking-[-0.02em]">
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-lg text-xs font-semibold",
                state === "done" ? "bg-known-soft text-known" : state === "current" ? "bg-moss text-moss-ink" : "bg-surface-2 text-ink-3")}
                aria-label={state === "done" ? "Read" : state === "current" ? "You are here" : "Ahead"}>
                {state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : (b.num ?? "•")}
              </span>
              {b.text}
            </h2>
          ) : (
            <h3 key={i} data-reveal data-page={b.page} className="mb-2 mt-7 text-[17px] font-semibold tracking-[-0.01em]">
              {b.num ? <span className="mr-2 text-ink-3">{b.num}</span> : null}{b.text}
            </h3>
          );
        }
        if (b.kind === "math") {
          return (
            <button key={i} type="button" data-reveal data-page={b.page} onClick={() => setPageView(b.page)}
              className="my-3 flex w-full items-center gap-3 rounded-[12px] border border-dashed border-line-2 px-4 py-2.5 text-left transition-colors hover:border-moss hover:bg-moss-soft/30">
              <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink-3">{b.text}</span>
              <span className="shrink-0 text-xs font-semibold text-moss-text">See the equation · p. {b.page}</span>
            </button>
          );
        }
        if (b.kind === "caption") {
          return (
            <figure key={i} data-reveal data-page={b.page} className="my-5 flex items-start gap-3 rounded-[var(--r)] border border-line bg-surface p-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-ink-2"><FileText className="size-4" /></span>
              <figcaption className="min-w-0 flex-1 text-[14px] text-ink-2"><b className="text-ink">{b.label}</b>{b.text.slice(b.label.length).replace(/^[:.]\s*/, ": ")}</figcaption>
              <button type="button" onClick={() => setPageView(b.page)} className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-line px-2.5 py-1 text-xs font-semibold hover:border-line-2">
                <Maximize2 className="size-3" /> View · p. {b.page}
              </button>
            </figure>
          );
        }
        return (
          <p key={i} id={`rf-${b.id}`} data-reveal data-page={b.page} className="psg reading group relative -mx-2 mb-4 scroll-mt-32 px-2 py-1">
            <button type="button" onClick={() => setPageView(b.page)} aria-label={`View page ${b.page} of the PDF`}
              className={cn("absolute -left-12 hidden rounded-md px-1.5 py-0.5 font-display text-[11px] font-semibold text-ink-3 opacity-0 transition-opacity hover:bg-surface-2 hover:text-ink group-hover:opacity-100 focus-visible:opacity-100 lg:block",
                citedBlocks?.has(b.id) ? "top-9" : "top-1.5")}>
              p. {b.page}
            </button>
            {citedBlocks?.get(b.id) ? <MarginPin refs={citedBlocks.get(b.id)!} /> : null}
            <TermText text={b.text} names={conceptNames} conceptState={conceptState} onConcept={onConcept} definitions={definitions} />
          </p>
        );
      })}

      <Dialog open={pageView !== null} onOpenChange={(o) => !o && setPageView(null)}>
        <DialogContent className="max-h-[92vh] max-w-[860px] overflow-auto rounded-[var(--r-xl)] bg-surface p-4">
          <DialogTitle className="text-[15px] font-semibold">Page {pageView} of the original PDF</DialogTitle>
          {pageFile && pageView ? (
            <Document file={pageFile} loading={<Loader2 className="mx-auto my-10 size-5 animate-spin" />}>
              <Page pageNumber={pageView} width={820} renderAnnotationLayer={false} />
            </Document>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Floating toolbar on text selection: ask the guide about exactly what you selected. */
function SelectionMenu({ container, onAsk }: { container: React.RefObject<HTMLDivElement | null>; onAsk: (q: string) => void }) {
  const [sel, setSel] = useState<{ text: string; x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const onUp = () => setTimeout(() => {
      const s = window.getSelection();
      const text = s?.toString().trim() ?? "";
      if (!s || s.isCollapsed || text.length < 3 || !container.current?.contains(s.anchorNode)) { setSel(null); return; }
      const r = s.getRangeAt(0).getBoundingClientRect();
      const box = container.current.getBoundingClientRect();
      setSel({ text: text.slice(0, 600), x: r.left + r.width / 2 - box.left, y: r.top - box.top });
      setCopied(false);
    }, 10);
    const onDown = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest("[data-selmenu]")) setSel(null); };
    document.addEventListener("mouseup", onUp);
    document.addEventListener("keyup", onUp);
    document.addEventListener("mousedown", onDown);
    return () => { document.removeEventListener("mouseup", onUp); document.removeEventListener("keyup", onUp); document.removeEventListener("mousedown", onDown); };
  }, [container]);
  if (!sel) return null;
  const short = sel.text.length > 160 ? sel.text.slice(0, 157) + "…" : sel.text;
  const act = (q: string) => { onAsk(q); setSel(null); window.getSelection()?.removeAllRanges(); };
  return (
    <div data-selmenu role="toolbar" aria-label="Selected text"
      className="absolute z-20 flex -translate-x-1/2 -translate-y-[calc(100%+8px)] items-center gap-0.5 rounded-pill bg-ink p-1 text-bg shadow-2 animate-pop"
      style={{ left: sel.x, top: sel.y }}>
      <button type="button" onClick={() => act(`Explain this passage from the paper: "${short}"`)} className="inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-[13px] font-semibold hover:bg-bg/15">
        <MessageCircleQuestion className="size-3.5" /> Ask the guide
      </button>
      <button type="button" onClick={() => act(`Explain this in simple words, like I'm new to the field: "${short}"`)} className="inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-[13px] font-semibold hover:bg-bg/15">
        <Sparkles className="size-3.5" /> Explain simply
      </button>
      <button type="button" aria-label="Copy" onClick={() => { void navigator.clipboard.writeText(sel.text); setCopied(true); }} className="grid size-8 place-items-center rounded-full hover:bg-bg/15">
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  );
}

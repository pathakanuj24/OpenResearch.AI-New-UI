"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUp, BookOpen, RefreshCw, Route, Sparkles } from "lucide-react";
import { Button, Eyebrow, FieldCover, ProgressRing, Segmented, type ConceptState } from "@/components/atlas";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAnalysis, useGraphStats, useJobs, useLastPaper, useMemory, usePaperConcepts, usePassages, useReingest, useSetConcept } from "@/lib/data";
import { fieldKey, fieldVar } from "@/lib/fields";
import type { SourceData } from "@/features/chat/types";
import { Guide, SUGGESTIONS, useResearchChat } from "@/features/guide/Guide";
import { useGuide } from "@/features/guide/store";
import { TrailView } from "@/features/trail/TrailView";
import { PassageColumn, type PassageTarget } from "./PassageColumn";
import type { PdfTarget } from "./PdfColumn.client";
import type { ReflowTarget } from "./ReflowReader.client";
import { usePrefs } from "@/lib/prefs";
import { useReadProgress } from "./progress";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import { ErrorBoundary } from "@/components/app/ErrorBoundary";

const PdfColumn = dynamic(() => import("./PdfColumn.client"), { ssr: false });
const ReflowReader = dynamic(() => import("./ReflowReader.client"), { ssr: false });

export function PaperScreen({ id }: { id: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = params.get("view") === "trail" ? "trail" : "read";
  const setLast = useLastPaper((s) => s.set);
  const { open, setOpen, ask } = useGuide();
  const analysis = useAnalysis(id);
  const stats = useGraphStats(id);
  const passages = usePassages(id);
  const concepts = usePaperConcepts(id);
  const memory = useMemory();
  const setConcept = useSetConcept(id);
  const chat = useResearchChat(id);
  const progress = useReadProgress((s) => s.read[id] ?? 0);
  const setProgress = useReadProgress((s) => s.set);
  const [passageTarget, setPassageTarget] = useState<PassageTarget | null>(null);
  const [pdfTarget, setPdfTarget] = useState<PdfTarget | null>(null);
  const [textTarget, setTextTarget] = useState<ReflowTarget | null>(null);
  const readerMode = usePrefs((s) => s.readerMode);
  const setPrefs = usePrefs((s) => s.set);
  const [section, setSection] = useState(0);
  const column = useRef<HTMLDivElement>(null);
  const [isDesktop, setDesktop] = useState(true);

  useEffect(() => { setLast(id); track({ type: "paper_opened", paper_id: id }); }, [id, setLast]);
  // Reading milestones (25/50/75/100%) for recommendations.
  const milestone = useRef(0);
  useEffect(() => {
    const m = Math.floor(progress * 4) * 25;
    if (m > milestone.current) { milestone.current = m; track({ type: "read_progress", paper_id: id, value: m }); }
  }, [progress, id]);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const f = () => setDesktop(mq.matches); f(); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f);
  }, []);
  // ?guide=1 opens the guide, ?ask=… sends a question (from Today's hero or ⌘K).
  useEffect(() => {
    const q = params.get("ask");
    if (q) ask(q); else if (params.get("guide")) setOpen(true);
    if (q || params.get("guide")) router.replace(`${pathname}${view === "trail" ? "?view=trail" : ""}`, { scroll: false });
  }, [params, ask, setOpen, router, pathname, view]);
  useEffect(() => () => setOpen(false), [setOpen]);

  // Reading progress + current section from scroll position.
  useEffect(() => {
    if (view !== "read") return;
    const onScroll = () => {
      const el = column.current; if (!el) return;
      const r = el.getBoundingClientRect();
      // Only measure once there's real content (the PDF loads after the page); avoids a false "100% read".
      if (r.height > window.innerHeight * 1.5) setProgress(id, Math.max(0, Math.min(1, (window.innerHeight - r.top) / r.height)));
      const secs = el.querySelectorAll<HTMLElement>("[data-section]");
      let cur = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.45) cur = i; });
      setSection(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    if (column.current) ro.observe(column.current);
    return () => { window.removeEventListener("scroll", onScroll); ro.disconnect(); };
  }, [id, view, setProgress, passages.data]);

  const stateMap = useMemo(() => {
    const m = new Map<string, ConceptState>();
    for (const c of memory.data?.concepts ?? []) m.set(c.name.toLowerCase(), c.status);
    for (const c of concepts.data ?? []) m.set(c.name.toLowerCase(), c.status as ConceptState);
    return m;
  }, [memory.data, concepts.data]);
  const conceptState = useCallback((name: string) => stateMap.get(name.toLowerCase()) ?? "new", [stateMap]);
  const definitions = useMemo(() => Object.fromEntries((concepts.data ?? []).map((c) => [c.name.toLowerCase(), c.definition])), [concepts.data]);
  const conceptNames = useMemo(() => (concepts.data ?? []).map((c) => c.name), [concepts.data]);
  const onConcept = useCallback((name: string, state: ConceptState) => setConcept.mutate({ name, state }), [setConcept]);

  const onCite = useCallback((s: SourceData) => {
    track({ type: "citation_opened", paper_id: id, value: s.page, meta: { section: s.section, chunk_id: s.chunk_id } });
    if (view === "trail") router.push(pathname, { scroll: false });
    const inText = passages.data?.sections.some((sec) => sec.passages.some((p) => p.id === s.chunk_id));
    setTimeout(() => {
      if (inText) setPassageTarget({ id: s.chunk_id, nonce: Date.now() });
      else if (usePrefs.getState().readerMode === "text") setTextTarget({ page: s.page, quote: s.quote, nonce: Date.now() });
      else setPdfTarget({ page: s.page, quote: s.quote, nonce: Date.now() });
    }, view === "trail" ? 300 : 0);
    if (!isDesktop) setOpen(false);
  }, [view, router, pathname, passages.data, isDesktop, setOpen, id]);

  const ds = analysis.data?.analysis?.document_summary;
  const title: string = ds?.title || stats.data?.title || analysis.data?.file_name?.replace(/\.pdf$/i, "") || "Paper";
  const field = stats.data?.field ?? null;
  const guide = (
    <ErrorBoundary area="the guide" resetKeys={[id]} className="m-4">
      <Guide paperId={id} paperTitle={title} chat={chat} onCite={onCite} conceptState={conceptState} onConcept={onConcept} onClose={() => setOpen(false)} className="h-full" />
    </ErrorBoundary>
  );

  return (
    <div>
      {/* Toolbar shared by Read and Trail */}
      <div className="sticky top-16 z-30 border-b border-line/60 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 md:px-6">
          <Link href="/today" aria-label="Back to Today" className="grid size-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2"><ArrowLeft className="size-[18px]" /></Link>
          <Segmented label="View" value={view} onChange={(v) => router.push(v === "trail" ? `${pathname}?view=trail` : pathname, { scroll: false })}
            options={[{ value: "read", label: <><BookOpen /> Read</> }, { value: "trail", label: <><Route /> Trail</> }]} />
          <p className="hidden min-w-0 flex-1 truncate font-read text-[15px] italic text-ink-2 md:block">{title}</p>
          {view === "read" && !passages.data?.sections.length ? (
            <Segmented label="Reading mode" value={readerMode} onChange={(v) => setPrefs({ readerMode: v })}
              options={[{ value: "text", label: "Text" }, { value: "pdf", label: "PDF" }]} />
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-[13px] text-ink-2 sm:flex"><ProgressRing value={progress} label="Read so far" /> {Math.round(progress * 100)}% read</span>
            <Button size="sm" variant={open ? "pri" : "sec"} onClick={() => setOpen(!open)} aria-pressed={open}><Sparkles /> Guide</Button>
          </div>
        </div>
      </div>

      <div className={cn("mx-auto max-w-[1440px]", open && isDesktop && "grid grid-cols-[minmax(0,1fr)_440px]")}>
        <div className="min-w-0">
          {view === "trail" ? (
            <TrailView paperId={id} title={title} conceptState={conceptState} onConcept={onConcept} />
          ) : (
            <article className="mx-auto max-w-[808px] px-4 pb-40 pt-6 md:px-6">
              <NotMappedBanner id={id} title={title} show={stats.isFetched && stats.data === null} />
              <FieldCover field={field} seed={id} label={false} className="rounded-[var(--r)]" height={120} />
              {field ? (
                <span className="mt-4 inline-flex items-center gap-2 rounded-pill px-3 py-1 text-[13px] font-semibold"
                  style={{ background: `color-mix(in srgb, ${fieldVar(fieldKey(field))} 16%, var(--surface))` }}>
                  <span className="size-2 rounded-full" style={{ background: fieldVar(fieldKey(field)) }} />
                  {field}{ds?.main_topic && !ds.main_topic.toLowerCase().startsWith(field.toLowerCase()) ? ` · ${ds.main_topic}` : ""}
                </span>
              ) : null}
              {analysis.isLoading && !stats.data ? <Skeleton className="mt-4 h-20" /> : (
                <h1 className="mt-3 font-read text-[28px] font-medium leading-[1.15] tracking-[-0.015em] md:text-[34px]">{title}</h1>
              )}
              <p className="mt-2 text-[13px] text-ink-2">{[(ds?.authors ?? []).slice(0, 4).join(", "), ds?.publication_year].filter(Boolean).join(" · ")}</p>

              {ds?.plain_language_summary ? (
                <div className="mt-6 rounded-[var(--r)] border border-line bg-surface p-5">
                  <Eyebrow>In plain words</Eyebrow>
                  <p className="answer mt-1">{ds.plain_language_summary}</p>
                  {ds.key_findings?.length ? (
                    <ul className="answer mt-3 list-disc space-y-1 pl-5 text-[15.5px] text-ink-2">
                      {ds.key_findings.slice(0, 5).map((f: string) => <li key={f}>{f}</li>)}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              <div ref={column} className="mt-4">
                <ErrorBoundary area="the reading view" resetKeys={[id, readerMode]} className="mt-8">
                {passages.isLoading ? <div className="space-y-3 pt-8">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
                  : passages.data?.sections.length ? (
                    <PassageColumn sections={passages.data.sections} current={section} target={passageTarget}
                      conceptState={conceptState} onConcept={onConcept} definitions={definitions} />
                  ) : readerMode === "text" ? (
                    <ReflowReader paperId={id} target={textTarget} current={section} conceptNames={conceptNames} conceptState={conceptState}
                      onConcept={onConcept} definitions={definitions} onAsk={(q) => ask(q)} />
                  ) : (
                    <div className="pt-6"><PdfColumn paperId={id} target={pdfTarget} /></div>
                  )}
                </ErrorBoundary>
              </div>
              <Extras analysis={analysis.data?.analysis} />
            </article>
          )}
        </div>
        {open && isDesktop ? (
          <div className="sticky top-[120px] h-[calc(100dvh-120px)] border-l border-line">{guide}</div>
        ) : null}
      </div>

      {!isDesktop ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="h-[82vh] rounded-t-[28px] p-0 [&>button]:hidden">
            <SheetTitle className="sr-only">Guide</SheetTitle>
            {guide}
          </SheetContent>
        </Sheet>
      ) : null}

      {!open ? <AskBar onAsk={(q) => ask(q)} waiting={stats.isFetched && stats.data === null} /> : null}
    </div>
  );
}

function AskBar({ onAsk, waiting }: { onAsk: (q: string) => void; waiting?: boolean }) {
  const [q, setQ] = useState("");
  if (waiting) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 md:bottom-5">
        <p className="pointer-events-auto flex items-center gap-2.5 rounded-pill border border-line bg-surface px-4 py-2.5 text-sm text-ink-2 shadow-2" aria-live="polite">
          <span className="size-2 rounded-full bg-sun" style={{ animation: "pulse-dot .9s infinite" }} />
          The guide will be ready when the paper is mapped. You can read the PDF meanwhile.
        </p>
      </div>
    );
  }
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex flex-col items-center gap-2 px-4 md:bottom-5">
      <div className="pointer-events-auto hidden flex-wrap justify-center gap-1.5 md:flex">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" onClick={() => onAsk(s)}
            className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-[13.5px] font-medium shadow-1 transition-transform duration-[var(--t-med)] ease-spring hover:-translate-y-0.5">{s}</button>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) { onAsk(q.trim()); setQ(""); } }}
        className="pointer-events-auto flex w-full max-w-[640px] items-center gap-2 rounded-pill border border-line bg-surface p-1.5 pl-2 shadow-2 focus-within:border-moss">
        <span className="size-9 shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,var(--sun),var(--moss))]" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask the guide about this paper…" aria-label="Ask the guide about this paper"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3" />
        <button type="submit" disabled={!q.trim()} aria-label="Ask" className="grid size-9 place-items-center rounded-full bg-moss text-moss-ink transition-opacity disabled:opacity-40"><ArrowUp className="size-4" /></button>
      </form>
    </div>
  );
}

function NotMappedBanner({ id, title, show }: { id: string; title: string; show: boolean }) {
  const reingest = useReingest();
  const job = useJobs((s) => s.jobs.find((j) => j.paperId === id));
  if (!show) return null;
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[var(--r)] border border-line bg-sun-soft px-4 py-3 text-sun-ink">
      <p className="flex-1 text-sm">
        {job ? <>Mapping this paper{job.stage ? `: ${job.stage}` : "…"} The guide and trail will work once it&apos;s done.</>
          : <>This paper isn&apos;t mapped yet, so the guide can&apos;t cite passages and there&apos;s no trail. Mapping takes about a minute.</>}
      </p>
      {!job ? <Button size="sm" variant="pri" loading={reingest.isPending} onClick={() => reingest.mutate({ id, title })}><RefreshCw /> Map this paper</Button> : null}
    </div>
  );
}

type Analysis = { glossary?: { technical_terms?: { term: string; definition: string }[] }; references?: { title?: string; text?: string; authors?: string | string[]; year?: number }[] | { references?: unknown[] } };

function Extras({ analysis }: { analysis?: Analysis }) {
  const terms = analysis?.glossary?.technical_terms ?? [];
  const refsRaw = analysis?.references;
  const refs = (Array.isArray(refsRaw) ? refsRaw : ((refsRaw as { references?: unknown[] })?.references ?? [])) as { title?: string; text?: string; authors?: string | string[]; year?: number }[];
  if (!terms.length && !refs.length) return null;
  return (
    <div className="mt-14 space-y-3">
      {terms.length ? (
        <details className="rounded-[var(--r)] border border-line bg-surface p-5">
          <summary className="cursor-pointer text-[17px] font-semibold">Glossary <span className="text-ink-3">{terms.length}</span></summary>
          <dl className="mt-3 space-y-3">
            {terms.map((t) => (<div key={t.term}><dt className="font-semibold">{t.term}</dt><dd className="answer text-[15.5px] text-ink-2">{t.definition}</dd></div>))}
          </dl>
        </details>
      ) : null}
      {refs.length ? (
        <details className="rounded-[var(--r)] border border-line bg-surface p-5">
          <summary className="cursor-pointer text-[17px] font-semibold">References <span className="text-ink-3">{refs.length}</span></summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14.5px]">
            {refs.map((r, i) => (
              <li key={i}><span className="font-read">{r.title || r.text}</span>
                <span className="block text-[13px] text-ink-3">{[Array.isArray(r.authors) ? r.authors.slice(0, 3).join(", ") : r.authors, r.year].filter(Boolean).join(" · ")}</span></li>
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}

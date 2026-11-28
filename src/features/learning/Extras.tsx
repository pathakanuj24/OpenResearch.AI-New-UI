"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Check, Clock, Flag, Play, RotateCcw } from "lucide-react";
import { KIND, kindOf, type ConceptState } from "@/components/atlas";
import { usePrefs } from "@/lib/prefs";
import { useSetConcept } from "@/lib/data";
import { fieldKey, fieldVar } from "@/lib/fields";
import { shortTitle } from "@/lib/trail";
import { cn } from "@/lib/utils";
import type { BoardConcept, Card } from "./cards";

// ---------------------------------------------------------------- today's session

type Step = {
  key: string; concept: string; title: string; source: string; minutes: number; estimated: boolean;
  href: string; kind: string; paper?: boolean;
};

const kindLook = (kind: string) => (kind === "paper-read" ? { label: "Paper", color: "var(--moss)", icon: BookOpen } : KIND[kindOf(kind)]);

/**
 * A route through one sitting, sized to the reader's session length: concepts in progress first, then ones ready to
 * learn, each with its best resource; whatever time is left goes to reading the paper itself (the last stop).
 */
export function SessionPlan({ cards, paper }: { cards: Card[]; paper?: { id: string; title: string } }) {
  const budget = usePrefs((s) => s.sessionMinutes) ?? 30;
  const steps = useMemo(() => {
    const queue = [...cards.filter((c) => c.state === "learning"), ...cards.filter((c) => c.ready)].filter((c) => c.resource);
    const out: Step[] = [];
    let used = 0;
    for (const c of queue) {
      const m = c.minutes ?? 10;
      if (out.length && used + m > budget) continue;
      out.push({ key: c.key, concept: c.name, title: c.resource!.title.replace(/[.\s]+$/, ""), source: c.resource!.source,
        minutes: m, estimated: c.minutes == null, href: c.resource!.url, kind: String(c.resource!.kind) });
      used += m;
      if (used >= budget) break;
    }
    if (paper && used < budget) {
      out.push({ key: "paper", concept: "Read the paper", title: paper.title, source: "Pick up where you left off",
        minutes: budget - used, estimated: false, href: `/papers/${paper.id}`, kind: "paper-read", paper: true });
    }
    return out;
  }, [cards, budget, paper]);
  if (!steps.length) return null;
  const total = steps.reduce((a, s) => a + s.minutes, 0);

  return (
    <section aria-labelledby="session-title" className="mt-4 rounded-[var(--r-lg)] border border-line bg-surface p-5 shadow-1">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h3 id="session-title" className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em]">
            <Clock className="size-[18px] text-moss-text" aria-hidden />Today&apos;s session
          </h3>
          <p className="mt-0.5 text-[13px] text-ink-3">
            {steps.length} stop{steps.length > 1 ? "s" : ""} · {total} min, in the order to do them ·{" "}
            <Link href="/settings#learning" className="font-semibold text-moss-text hover:underline">Change length</Link>
          </p>
        </div>
        {/* Time ruler: each stop's share of the sitting, in the kind's colour, with minute marks. */}
        <div className="w-full max-w-[340px]" aria-hidden>
          <div className="flex h-2 gap-[3px] overflow-hidden rounded-pill">
            {steps.map((s, i) => (
              <span key={s.key} className="h-full origin-left first:rounded-l-pill last:rounded-r-pill"
                style={{ flexGrow: s.minutes, background: kindLook(s.kind).color, animation: `grow-x .7s var(--ease) ${i * 110}ms backwards` }} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] font-semibold tabular-nums text-ink-3"><span>0</span><span>{Math.round(total / 2)}</span><span>{total} min</span></div>
        </div>
      </div>

      <ol className="mt-5 grid gap-3 lg:gap-4 lg:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]" style={{ ["--n" as string]: Math.min(steps.length, 5) }}>
        {steps.map((s, i) => <Stop key={s.key} step={s} index={i} last={i === steps.length - 1} />)}
      </ol>
    </section>
  );
}

function Stop({ step: s, index, last }: { step: Step; index: number; last: boolean }) {
  const look = kindLook(s.kind);
  const Icon = s.kind === "video" ? Play : look.icon;
  const card = (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5 text-[11.5px] font-semibold"
          style={{ background: `color-mix(in srgb, ${look.color} 14%, transparent)`, color: `color-mix(in srgb, ${look.color} 80%, var(--ink))` }}>
          <Icon className="size-3" aria-hidden />{look.label}
        </span>
        <span className="text-[12px] font-semibold tabular-nums text-ink-2" title={s.estimated ? "Estimated: the source doesn't give a length" : undefined}>
          {s.estimated ? "~" : ""}{s.minutes} min
        </span>
      </span>
      <span className="mt-2 block text-[15px] font-semibold leading-snug">{s.concept}</span>
      <span className={cn("mt-0.5 line-clamp-2 font-read text-[13.5px] leading-snug text-ink-2", s.paper && "italic")}>{s.title}</span>
      <span className="mt-auto flex items-center gap-1 pt-2 text-[12px] text-ink-3">
        <span className="min-w-0 truncate">{s.source}</span>
        <ArrowUpRight className="size-3.5 shrink-0 -translate-x-1 opacity-0 transition-[translate,opacity] duration-[var(--t-med)] ease-spring group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
      </span>
    </>
  );
  const cls = cn("group flex min-h-[132px] flex-1 flex-col rounded-[var(--r)] border p-3.5 transition-[translate,box-shadow,border-color] duration-[var(--t-med)] ease-spring hover:-translate-y-0.5 hover:shadow-2",
    s.paper ? "border-moss/40 bg-moss-soft/60 hover:border-moss" : "border-line bg-bg hover:border-line-2");
  return (
    <li className="relative flex gap-3 animate-enter lg:flex-col lg:gap-2.5" style={{ animationDelay: `${index * 90}ms` }}>
      {/* Route: a dotted line from this stop's marker to the next (down on small screens, across on wide ones). */}
      {!last ? (
        <span aria-hidden className="absolute bottom-[-14px] left-[13px] top-8 border-l-2 border-dashed border-line-2 lg:bottom-auto lg:left-9 lg:right-[-14px] lg:top-[13px] lg:border-l-0 lg:border-t-2" />
      ) : null}
      <span className={cn("relative z-[1] grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold shadow-1",
        s.paper ? "bg-sun text-sun-ink" : "bg-moss text-moss-ink")} aria-hidden>
        {s.paper ? <Flag className="size-3.5" /> : index + 1}
      </span>
      {s.paper
        ? <Link href={s.href} className={cls} aria-label={`Stop ${index + 1}: read the paper, ${s.minutes} minutes`}>{card}</Link>
        : <a href={s.href} target="_blank" rel="noopener noreferrer" className={cls}
            aria-label={`Stop ${index + 1}: ${s.concept}. ${look.label}: ${s.title}, ${s.estimated ? "about " : ""}${s.minutes} minutes`}>{card}</a>}
    </li>
  );
}

// ---------------------------------------------------------------- due for review

const REVIEW_AFTER_DAYS = 14;

/** Known concepts not revisited for a while. "Still know it" re-stamps them; "Refresh" moves them back to In progress. */
export function DueForReview({ concepts }: { concepts: (BoardConcept & { updated?: string })[] }) {
  const setConcept = useSetConcept();
  const [now] = useState(() => Date.now()); // read the clock once, not on every render
  const due = useMemo(() => {
    const cutoff = now - REVIEW_AFTER_DAYS * 864e5;
    return concepts.filter((c) => c.state === "known" && c.updated && Date.parse(c.updated) < cutoff)
      .sort((a, b) => (a.updated ?? "").localeCompare(b.updated ?? "")).slice(0, 6);
  }, [concepts, now]);
  if (!due.length) return null;
  const set = (name: string, state: ConceptState) => setConcept.mutate({ name, state, quiet: true });
  return (
    <section className="mt-6" aria-labelledby="review-title">
      <h2 id="review-title" className="text-[18px] font-semibold">Due for review <span className="text-ink-3">· {due.length}</span></h2>
      <p className="text-sm text-ink-3">Known, but not touched in {REVIEW_AFTER_DAYS}+ days. A quick check keeps them known.</p>
      <div className="stagger mt-3 flex gap-3 overflow-x-auto pb-1">
        {due.map((c) => {
          const days = Math.round((now - Date.parse(c.updated!)) / 864e5);
          return (
            <div key={c.key} className="w-[260px] shrink-0 rounded-[var(--r)] border border-line bg-surface p-3.5 shadow-1">
              <p className="text-[12px] font-semibold text-ink-3">{days} days ago</p>
              <p className="mt-0.5 font-semibold">{c.name}</p>
              {c.definition ? <p className="mt-1 line-clamp-2 font-read text-[13px] text-ink-2">{c.definition}</p> : null}
              <div className="mt-3 flex gap-1.5">
                <button type="button" onClick={() => set(c.name, "known")} className="inline-flex h-8 items-center gap-1 rounded-pill bg-known-soft px-3 text-[12.5px] font-semibold text-known transition-transform active:scale-95"><Check className="size-3.5" aria-hidden />Still know it</button>
                <button type="button" onClick={() => set(c.name, "learning")} className="inline-flex h-8 items-center gap-1 rounded-pill px-3 text-[12.5px] font-semibold text-ink-2 hover:bg-surface-2"><RotateCcw className="size-3.5" aria-hidden />Refresh</button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- cross-paper links

/** Concepts that appear in two or more of your papers, drawn as links between concept and paper. */
export function CrossPaper({ concepts }: { concepts: BoardConcept[] }) {
  const shared = useMemo(() => concepts.filter((c) => c.papers.length > 1).sort((a, b) => b.papers.length - a.papers.length).slice(0, 8), [concepts]);
  const papers = useMemo(() => {
    const m = new Map<string, { id: string; title: string; field?: string | null }>();
    for (const c of shared) for (const p of c.papers) m.set(p.id, p);
    return [...m.values()].slice(0, 6);
  }, [shared]);
  if (!shared.length) return null;
  const W = 760, rowH = 40, H = Math.max(shared.length, papers.length) * rowH + 20;
  const cy = (i: number, n: number) => 10 + (H - 20) * ((i + 0.5) / n);
  return (
    <section className="mt-6 rounded-[var(--r-lg)] border border-line bg-surface p-5 shadow-1" aria-labelledby="cross-title">
      <h2 id="cross-title" className="text-[18px] font-semibold">Across your papers</h2>
      <p className="text-sm text-ink-3">Concepts that show up in more than one paper. Learning them pays off more than once.</p>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full min-w-[560px]" role="img"
          aria-label={shared.map((c) => `${c.name} appears in ${c.papers.length} papers`).join("; ")}>
          {shared.map((c, i) => c.papers.map((p) => {
            const j = papers.findIndex((x) => x.id === p.id);
            if (j < 0) return null;
            const y1 = cy(i, shared.length), y2 = cy(j, papers.length);
            return <path key={`${c.key}-${p.id}`} d={`M250,${y1} C400,${y1} 400,${y2} 520,${y2}`} fill="none" pathLength={1}
              stroke={c.state === "known" ? "var(--known)" : "var(--line-2)"} strokeWidth={c.state === "known" ? 2 : 1.5}
              style={{ ["--len" as string]: 1, strokeDasharray: 1, animation: `draw 1s var(--ease) ${200 + i * 60}ms backwards` }} />;
          }))}
          {shared.map((c, i) => (
            <g key={c.key} transform={`translate(250,${cy(i, shared.length)})`}>
              <circle r="6" fill={c.state === "known" ? "var(--known)" : c.state === "learning" ? "var(--learning)" : "var(--surface)"} stroke={c.state === "new" ? "var(--new)" : "none"} strokeWidth="2" />
              <text x="-14" y="4.5" textAnchor="end" fontSize="13.5" fontWeight="600" fill="var(--ink)" fontFamily="var(--display)">{shortTitle(c.name, 26)}</text>
              <text x="-14" y="18" textAnchor="end" fontSize="11" fill="var(--ink-3)" fontFamily="var(--display)">in {c.papers.length} papers</text>
            </g>
          ))}
          {papers.map((p, j) => (
            <g key={p.id} transform={`translate(520,${cy(j, papers.length)})`}>
              <rect x="-5" y="-7" width="10" height="14" rx="2" fill={fieldVar(fieldKey(p.field))} />
              <text x="14" y="4.5" fontSize="13" fontWeight="600" fill="var(--ink-2)" fontFamily="var(--display)">{shortTitle(p.title, 30)}</text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}


"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, Check, ChevronDown, FileText, Flag, Loader2, Lock, Plus, Sparkles, Timer } from "lucide-react";
import { KIND, ProgressRing, StateIcon, kindOf, resourceImage, type AtlasResource, type ConceptState } from "@/components/atlas";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapWork } from "@/lib/api/v2";
import { useAddFromWork, useConceptResources, useLastPaper, useSetConcept, useUpload } from "@/lib/data";
import { fieldKey, fieldVar } from "@/lib/fields";
import { usePrefs } from "@/lib/prefs";
import { dedupeWorks, shortTitle } from "@/lib/trail";
import { cn } from "@/lib/utils";
import { useBoardCards, type BoardConcept, type BoardPaper, type Card } from "./cards";
import { SessionPlan } from "./Extras";
import { ProveIt, type ProveResult } from "./ProveIt";

const STATES: { state: ConceptState; label: string }[] = [
  { state: "new", label: "To learn" }, { state: "learning", label: "Learning" }, { state: "known", label: "Known" },
];
const stateLabel = (s: ConceptState) => STATES.find((x) => x.state === s)!.label;

/**
 * My learning, organised around one paper's timeline:
 *   1 Before  — what to know first (prerequisite concepts, in order) and the earlier papers it builds on
 *   2 Now     — the paper's own ideas (core concepts and what it adds)
 *   3 After   — later papers that cite it, with material to learn them
 * Every concept keeps its state (Known goes through "Prove it") and its resources.
 */
export function Journey({ papers, concepts }: { papers: BoardPaper[]; concepts: BoardConcept[] }) {
  const last = useLastPaper((s) => s.id);
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const paper = chosen ?? (papers.some((p) => p.id === last) ? last : papers[0]?.id) ?? null;
  const [overrides, setOverrides] = useState<Record<string, ConceptState>>({});
  const [verifiedOv, setVerifiedOv] = useState<Record<string, boolean>>({});
  const [proving, setProving] = useState<Card | null>(null);
  const [stamped, setStamped] = useState<string | null>(null);
  const proveIt = usePrefs((s) => s.proveIt);
  const setConcept = useSetConcept(paper ?? undefined);
  const { cards, loading, map } = useBoardCards(paper, concepts, overrides, verifiedOv);
  const sel = papers.find((p) => p.id === paper);
  const paperRef = sel ? { id: sel.id, title: sel.title } : null;

  const move = (card: Card, to: ConceptState, opts: { undo?: boolean; checked?: boolean; verified?: boolean } = {}) => {
    const from = card.state;
    if (from === to) return;
    if (to === "known" && proveIt && !opts.undo && !opts.checked && paperRef) { setProving(card); return; }
    const verified = to === "known" && Boolean(opts.verified);
    setOverrides((o) => ({ ...o, [card.key]: to }));
    setVerifiedOv((v) => ({ ...v, [card.key]: verified }));
    setConcept.mutate({ name: card.name, state: to, quiet: true, verified }, {
      onError: () => {
        setOverrides((o) => { const n = { ...o }; delete n[card.key]; return n; });
        setVerifiedOv((v) => { const n = { ...v }; delete n[card.key]; return n; });
      },
    });
    if (opts.undo) return;
    if (to === "known") {
      setStamped(card.key);
      setTimeout(() => setStamped((k) => (k === card.key ? null : k)), 1400);
    }
    toast(to === "known" ? `${verified ? "Verified" : "Stamped"}: ${card.name}` : `${card.name}: ${stateLabel(to)}`,
      { action: { label: "Undo", onClick: () => move({ ...card, state: to }, from, { undo: true }) } });
  };
  const onProved = (r: ProveResult) => {
    const card = proving;
    setProving(null);
    if (!card || r === "cancel") return;
    if (r === "learning") move(card, "learning", { checked: true });
    else move(card, "known", { checked: true, verified: r === "verified" });
  };

  const before = cards.filter((c) => c.role === "prerequisite");
  const now = cards.filter((c) => c.role !== "prerequisite");
  const after = map ? dedupeWorks(map.after).slice(0, 6) : [];
  const roots = map ? dedupeWorks(map.before).slice(0, 6) : [];
  const beforeLeft = before.filter((c) => c.state !== "known");
  const nowLeft = now.filter((c) => c.state !== "known");
  // "You are here": the first section with something still to learn.
  const here = beforeLeft.length ? 1 : nowLeft.length ? 2 : 3;
  const actions = { move, stamped };
  // Papers already in the library (matched by title) show "In your library" instead of a duplicate "Add".
  const owned = new Map(papers.map((p) => [normTitle(p.title), p.id]));

  return (
    <section className="mt-8" aria-label="Your learning journey for one paper">
      <div role="tablist" aria-label="Paper" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {papers.map((p) => (
          <button key={p.id} role="tab" aria-selected={paper === p.id} type="button" onClick={() => setChosen(p.id)}
            className={cn("flex shrink-0 items-center gap-2.5 rounded-pill border py-1.5 pl-1.5 pr-4 text-[13.5px] font-semibold transition-[background-color,border-color,box-shadow] duration-[var(--t-med)]",
              paper === p.id ? "border-transparent bg-ink text-bg shadow-2" : "border-line bg-surface text-ink-2 hover:border-line-2 hover:text-ink")}>
            <span className="relative grid size-7 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${fieldVar(fieldKey(p.field))} 22%, transparent)` }}>
              <ProgressRing value={p.total ? p.known / p.total : 0} size={26} stroke={3} label={`${p.known} of ${p.total} known`} />
            </span>
            {shortTitle(p.title, 34)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-5 space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-48 rounded-[var(--r-lg)]" />)}</div>
      ) : !map || !paperRef ? (
        <div className="mt-5 rounded-[var(--r-lg)] border border-line bg-surface p-6 text-center shadow-1">
          <p className="font-semibold">This paper isn&apos;t mapped yet.</p>
          <p className="mt-1 text-sm text-ink-2">Once it is, you&apos;ll see what to learn before, in and after it.</p>
          {paperRef ? <Link href={`/papers/${paperRef.id}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-moss-text hover:underline">Open the paper <ArrowRight className="size-3.5" /></Link> : null}
        </div>
      ) : (
        <div key={paper} className="animate-fade-in">
          <SessionPlan cards={cards} paper={paperRef} />

          <ol className="mt-8 space-y-10">
            <Stage n={1} here={here === 1} done={!beforeLeft.length} eyebrow="Before" title="Get ready to read"
              sub={`What ${shortTitle(paperRef.title, 40)} assumes you know, in the order to learn it.`}
              meta={before.length ? <Progress known={before.length - beforeLeft.length} total={before.length} minutes={beforeLeft.reduce((a, c) => a + (c.minutes ?? 10), 0)} /> : null}>
              {before.length ? <ConceptGrid cards={before} paper={paperRef} actions={actions} /> : <Empty>This paper doesn&apos;t assume anything you haven&apos;t got.</Empty>}
              {roots.length ? (
                <>
                  <h4 className="mt-7 text-[15px] font-semibold">Papers it builds on</h4>
                  <p className="text-[13px] text-ink-3">The most influential work it cites, oldest first. Skim these if a concept above feels shaky.</p>
                  <WorkGrid works={roots} canAdd owned={owned} />
                </>
              ) : null}
            </Stage>

            <Stage n={2} here={here === 2} done={!nowLeft.length} eyebrow="Now" title="Inside this paper"
              sub="The ideas the paper uses and what it adds. Learn them from the resources, then prove you've got them."
              meta={now.length ? <Progress known={now.length - nowLeft.length} total={now.length} minutes={nowLeft.reduce((a, c) => a + (c.minutes ?? 10), 0)} /> : null}>
              {now.length ? <ConceptGrid cards={now} paper={paperRef} actions={actions} /> : <Empty>No core concepts were found for this paper.</Empty>}
            </Stage>

            <Stage n={3} here={here === 3} done={false} eyebrow="After" title="Where it went next" last
              sub="Later papers that cite this one. Find material to learn them, or add one to your library to map it fully.">
              {after.length ? <WorkGrid works={after} canAdd future owned={owned} /> : <Empty>No later papers found yet. Newer papers take time to be indexed.</Empty>}
            </Stage>
          </ol>

          {proving ? <ProveIt key={proving.key} open concept={proving.name} paper={paperRef} onDone={onProved} /> : null}
        </div>
      )}
    </section>
  );
}

type Actions = { move: (c: Card, to: ConceptState) => void; stamped: string | null };

/** One stage of the journey, joined to the next by the route line; the sun flag marks where you are. */
function Stage({ n, eyebrow, title, sub, meta, here, done, last, children }: {
  n: number; eyebrow: string; title: string; sub: string; meta?: React.ReactNode; here: boolean; done: boolean; last?: boolean; children: React.ReactNode;
}) {
  return (
    <li className="relative grid gap-4 md:grid-cols-[44px_minmax(0,1fr)] md:gap-5">
      {!last ? <span aria-hidden className="absolute bottom-[-40px] left-[21px] top-12 hidden border-l-2 border-dashed border-line-2 md:block" /> : null}
      <div className="relative hidden md:block">
        <span className={cn("relative z-[1] grid size-11 place-items-center rounded-full text-[17px] font-bold shadow-1",
          done ? "bg-known text-surface" : here ? "bg-moss text-moss-ink" : "border-2 border-line-2 bg-surface text-ink-2")}>
          {done ? <BadgeCheck className="size-5" aria-label="Done" /> : n}
        </span>
        {here ? <Flag className="absolute -right-2 -top-3 size-5 fill-sun text-sun" aria-label="You are here" /> : null}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[12.5px] font-bold uppercase tracking-[.1em] text-ink-3"><span className="md:hidden">{n} · </span>{eyebrow}{here ? <span className="ml-2 rounded-pill bg-sun px-2 py-0.5 text-[10.5px] text-sun-ink">You are here</span> : null}</p>
            <h2 className="text-[24px] font-semibold tracking-[-0.025em]">{title}</h2>
            <p className="max-w-[62ch] text-[14px] text-ink-2">{sub}</p>
          </div>
          {meta}
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </li>
  );
}

function Progress({ known, total, minutes }: { known: number; total: number; minutes: number }) {
  return (
    <p className="flex items-center gap-2.5 rounded-pill bg-surface px-3.5 py-1.5 text-[13px] shadow-1">
      <ProgressRing value={total ? known / total : 0} size={22} label={`${known} of ${total} known`} />
      <span><b>{known} of {total}</b> known</span>
      {known < total ? <span className="flex items-center gap-1 text-ink-3"><Timer className="size-3.5" aria-hidden />~{minutes} min left</span> : null}
    </p>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-[var(--r)] border border-dashed border-line-2 px-4 py-6 text-center text-[14px] text-ink-3">{children}</p>;
}

// ---------------------------------------------------------------- concepts

function ConceptGrid({ cards, paper, actions }: { cards: Card[]; paper: { id: string; title: string }; actions: Actions }) {
  // items-start: each card keeps its own height, so expanding one doesn't stretch its neighbour.
  return <div className="stagger grid items-start gap-3 lg:grid-cols-2">{cards.map((c) => <ConceptCard key={c.key} card={c} paper={paper} actions={actions} />)}</div>;
}

function ConceptCard({ card, paper, actions }: { card: Card; paper: { id: string; title: string }; actions: Actions }) {
  const router = useRouter();
  const [more, setMore] = useState(false);
  const extra = useConceptResources(card.name, more);
  const tone = card.state === "known" ? "var(--known)" : card.state === "learning" ? "var(--learning)" : "var(--new)";
  return (
    <article className={cn("relative flex flex-col rounded-[var(--r)] border bg-surface p-4 shadow-1 transition-[translate,box-shadow,border-color] duration-[var(--t-med)] ease-spring hover:-translate-y-0.5 hover:shadow-2",
      card.ready ? "border-sun shadow-[0_0_0_3px_var(--sun-soft)]" : "border-line")}>
      {actions.stamped === card.key ? (
        <span aria-hidden className="pointer-events-none absolute right-3 top-3 grid size-16 place-items-center rounded-full border-[3px] border-known bg-known-soft text-[10px] font-bold uppercase tracking-[.08em] text-known"
          style={{ animation: "ink-in .6s var(--spring) both" }}>Known</span>
      ) : null}
      <div className="flex items-start gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`${card.name}: ${stateLabel(card.state)}. Change`}
              className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full transition-transform duration-[var(--t-med)] ease-spring hover:scale-110"
              style={{ background: `var(--${card.state}-soft)`, color: tone }}>
              <StateIcon state={card.state} className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="rounded-lg">
            <DropdownMenuLabel className="text-xs text-ink-3">I&apos;m at…</DropdownMenuLabel>
            {STATES.map((s) => (
              <DropdownMenuItem key={s.state} disabled={s.state === card.state} onSelect={() => actions.move(card, s.state)} className="gap-2">
                <StateIcon state={s.state} />{s.label}{s.state === "known" ? <span className="ml-auto text-[11px] text-ink-3">prove it</span> : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="text-[16px] font-semibold leading-snug">{card.name}</h4>
            {card.ready ? <span className="inline-flex items-center gap-1 rounded-pill bg-sun px-2 py-0.5 text-[11px] font-semibold text-sun-ink"><Sparkles className="size-3" aria-hidden />Ready to learn</span> : null}
            {card.state === "known" && card.verified ? <span className="inline-flex items-center gap-1 rounded-pill bg-known-soft px-2 py-0.5 text-[11px] font-semibold text-known"><BadgeCheck className="size-3" aria-hidden />Verified</span> : null}
            {card.role === "contribution" ? <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink-2">New in this paper</span> : null}
          </div>
          {card.definition ? <p className="mt-1 line-clamp-2 font-read text-[14px] leading-relaxed text-ink-2">{card.definition}</p> : null}
          {card.locked.length || card.unlocks.length ? (
            <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-ink-3">
              {card.locked.length ? <span className="inline-flex items-center gap-1"><Lock className="size-3" aria-hidden />Needs {card.locked.slice(0, 2).join(", ")}</span> : null}
              {card.unlocks.length ? <span className="inline-flex items-center gap-1"><ArrowRight className="size-3" aria-hidden />Unlocks {card.unlocks.slice(0, 2).join(", ")}</span> : null}
            </p>
          ) : null}
        </div>
      </div>

      {card.resource && card.state !== "known" ? <ResourceRow r={card.resource} minutes={card.minutes} className="mt-3" /> : null}
      {more ? (
        <div className="mt-2 grid gap-1.5 animate-enter">
          {extra.isLoading ? <Skeleton className="h-12" /> : uniqueByTitle(extra.data ?? [], card.resource).slice(0, 4).map((r) => <ResourceRow key={r.url} r={r} />)}
          {extra.isFetched && !(extra.data ?? []).length ? <p className="text-[12.5px] text-ink-3">No more resources found. Ask Iris to explain it from the paper.</p> : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-2.5">
        <button type="button" onClick={() => router.push(`/papers/${paper.id}?ask=${encodeURIComponent(`Explain ${card.name} using this paper`)}`)}
          className="inline-flex h-8 items-center gap-1.5 rounded-pill px-2.5 text-[12.5px] font-semibold text-moss-text hover:bg-moss-soft">
          <Sparkles className="size-3.5" aria-hidden />Ask Iris
        </button>
        <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more}
          className="ml-auto inline-flex h-8 items-center gap-1 rounded-pill px-2.5 text-[12.5px] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink">
          {more ? "Fewer" : "More resources"}<ChevronDown className={cn("size-3.5 transition-transform", more && "rotate-180")} aria-hidden />
        </button>
      </div>
    </article>
  );
}

/** Search often returns the same article twice (mirrors, tracking links): keep the first of each title. */
function uniqueByTitle(list: AtlasResource[], skip?: AtlasResource | null) {
  const norm = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const seen = new Set(skip ? [norm(skip.title)] : []);
  return list.filter((r) => { const k = norm(r.title); if (seen.has(k)) return false; seen.add(k); return true; });
}

/** A compact, clickable resource: thumbnail (or kind icon), title, source and length. */
function ResourceRow({ r, minutes, className }: { r: AtlasResource; minutes?: number | null; className?: string }) {
  const k = KIND[kindOf(String(r.kind))];
  const Icon = k.icon;
  const img = resourceImage(r);
  const mins = minutes ?? (r.duration ? Number(String(r.duration).match(/\d+/)?.[0]) || null : null);
  return (
    <a href={r.url} target="_blank" rel="noopener noreferrer"
      className={cn("group/res flex items-center gap-3 rounded-[var(--r-sm)] bg-surface-2 p-1.5 pr-3 transition-colors hover:bg-moss-soft", className)}>
      <span className="relative grid h-10 w-16 shrink-0 place-items-center overflow-hidden rounded-md text-white" style={{ background: k.color }}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover transition-transform duration-[var(--t-slow)] group-hover/res:scale-110" />
        ) : null}
        <Icon className="relative size-4 drop-shadow" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 text-[13px] font-semibold">{r.title}</span>
        <span className="text-[11.5px] text-ink-3">{k.label} · {r.source}{mins ? ` · ${mins} min` : ""}</span>
      </span>
      <ArrowUpRight className="size-3.5 shrink-0 text-ink-3 opacity-0 transition-opacity group-hover/res:opacity-100" aria-hidden />
    </a>
  );
}

// ---------------------------------------------------------------- papers (before / after)

const normTitle = (t: string) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

function WorkGrid({ works, canAdd, future, owned }: { works: MapWork[]; canAdd?: boolean; future?: boolean; owned: Map<string, string> }) {
  const upload = useUpload();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  // Fallback when there's no open-access copy: let the reader upload a PDF they have.
  const pick = () => input.current?.click();
  return (
    <>
      {canAdd ? (
        <input ref={input} type="file" accept="application/pdf" className="hidden" aria-hidden
          onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) { const id = await upload(f); if (id) router.push(`/papers/${id}`); } }} />
      ) : null}
      <div className="stagger mt-3 grid items-start gap-3 lg:grid-cols-2">
        {works.map((w) => <WorkCard key={w.id} w={w} canAdd={canAdd} future={future} onUpload={pick} ownedId={owned.get(normTitle(w.title))} />)}
      </div>
    </>
  );
}

function WorkCard({ w, canAdd, future, onUpload, ownedId }: {
  w: MapWork; canAdd?: boolean; future?: boolean; onUpload: () => void; ownedId?: string;
}) {
  const [open, setOpen] = useState(false);
  const addFromWork = useAddFromWork();
  const [adding, setAdding] = useState<"idle" | "fetching" | "added">("idle");
  const [addedId, setAddedId] = useState<string | null>(null);
  const linkable = Boolean(w.openalex_id || w.doi);
  const add = async () => {
    if (!linkable) { onUpload(); return; }
    setAdding("fetching");
    const r = await addFromWork(w);
    if (r.paperId) { setAddedId(r.paperId); setAdding("added"); return; }
    setAdding("idle");
    if (r.notOpenAccess) {
      toast("This paper isn't open access, so it can't be fetched automatically.", { description: "If you have the PDF, upload it to add it.", action: { label: "Upload PDF", onClick: onUpload } });
    }
  };
  const material = useConceptResources(w.title, open);
  return (
    <article className="flex flex-col rounded-[var(--r)] border border-line bg-surface p-4 shadow-1 transition-[translate,box-shadow] duration-[var(--t-med)] ease-spring hover:-translate-y-0.5 hover:shadow-2">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-ink-2"><FileText className="size-4" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <h4 className="font-read text-[15.5px] font-medium leading-snug">{w.title}</h4>
          <p className="mt-0.5 text-[12.5px] text-ink-3">{[w.year, w.cited_by ? `cited ${w.cited_by.toLocaleString()} times` : null].filter(Boolean).join(" · ")}</p>
        </div>
      </div>
      {open ? (
        <div className="mt-3 grid gap-1.5 animate-enter">
          {material.isLoading ? <><Skeleton className="h-12" /><Skeleton className="h-12" /></>
            : uniqueByTitle(material.data ?? []).slice(0, 4).map((r) => <ResourceRow key={r.url} r={r} />)}
          {material.isFetched && !(material.data ?? []).length ? <p className="text-[12.5px] text-ink-3">No videos or articles found for this paper yet.{future ? " Add it to your library to get its full trail." : ""}</p> : null}
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-line pt-2.5">
        {w.url ? (
          <a href={w.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-pill px-2.5 text-[12.5px] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink">
            <BookOpen className="size-3.5" aria-hidden />Open paper
          </a>
        ) : null}
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
          className="inline-flex h-8 items-center gap-1 rounded-pill px-2.5 text-[12.5px] font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink">
          Learning material<ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
        </button>
        {ownedId ? (
          <Link href={`/papers/${ownedId}`} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-pill bg-known-soft px-3 text-[12.5px] font-semibold text-known">
            <Check className="size-3.5" aria-hidden />In your library
          </Link>
        ) : canAdd ? (
          adding === "added" && addedId ? (
            <Link href={`/papers/${addedId}`} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-pill bg-known-soft px-3 text-[12.5px] font-semibold text-known animate-pop">
              <Check className="size-3.5" aria-hidden />Open in library
            </Link>
          ) : (
            <button type="button" onClick={() => void add()} disabled={adding === "fetching"} aria-busy={adding === "fetching"}
              title={linkable ? "Fetch its open-access PDF and map it like this one" : "Upload its PDF to map it like this one"}
              className={cn("ml-auto inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-[12.5px] font-semibold transition-transform duration-[var(--t-med)] ease-spring",
                future ? "bg-moss text-moss-ink hover:-translate-y-0.5" : "border border-line-2 bg-surface text-ink hover:-translate-y-0.5 hover:border-ink-3",
                adding === "fetching" && "cursor-wait opacity-80 hover:translate-y-0")}>
              {adding === "fetching" ? <><Loader2 className="size-3.5 animate-spin" aria-hidden />Fetching…</> : <><Plus className="size-3.5" aria-hidden />Add to library</>}
            </button>
          )
        ) : null}
      </div>
    </article>
  );
}

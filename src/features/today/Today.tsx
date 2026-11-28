"use client";

import { useRouter } from "next/navigation";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button, Card, Eyebrow, FieldCover, MiniTrail, ProgressRing, Topo } from "@/components/atlas";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/auth/authStore";
import { useDeletePaper, useJobs, useLastPaper, useLibrary, useMap, useMemory, usePaperResources, useReingest, useUpload, type ShelfPaper } from "@/lib/data";
import { FIELD_LABEL, fieldKey, fieldVar, type FieldKey } from "@/lib/fields";
import { blockingConcept, buildTrail, shortTitle, unlocks } from "@/lib/trail";
import { cn } from "@/lib/utils";
import { FirstRun } from "./FirstRun";

export function Today() {
  const { papers, isLoading, error } = useLibrary();
  const lastId = useLastPaper((s) => s.id);
  if (isLoading) return <TodaySkeleton />;
  if (error) return <LoadError />;
  if (!papers?.length) return <FirstRun />;
  const ready = papers.filter((p) => p.status === "ready");
  const current = ready.find((p) => p.id === lastId) ?? ready[0];
  return (
    <div className="mx-auto max-w-[1220px] stagger space-y-5 px-4 pt-4 md:px-6">
      {current ? <Hero paper={current} /> : <ProcessingHero papers={papers} />}
      <Tiles paperId={current?.id} />
      <Shelf papers={papers} />
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Hero({ paper }: { paper: ShelfPaper }) {
  const user = useAuthStore((s) => s.user);
  const { data: map, isLoading } = useMap(paper.id);
  const first = user?.displayName?.split(" ")[0];
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  const stops = map ? buildTrail(map) : [];
  const block = map ? blockingConcept(map) : undefined;
  const left = stops.filter((s) => s.kind === "concept" && s.state !== "done").length;
  const title = shortTitle(paper.title, 60);
  const headline = !map ? `Pick up ${title}.` : left === 0 ? "You're ready for the paper." : left === 1 ? "One stop left before the paper." : `${left} stops left before the paper.`;
  const unlocked = map && block ? unlocks(map, block) : [];
  return (
    <section className="hero-surface relative overflow-hidden rounded-[28px] bg-moss px-6 py-8 text-moss-ink shadow-2 md:px-10 md:py-11">
      <Topo seed={paper.id} className="absolute inset-0 size-full" stroke="var(--moss-ink)" opacity={0.16} rings={11} centers={4} />
      <div className="relative grid items-center gap-6 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-[13px] font-semibold opacity-80">{date}{first ? ` · ${greeting()}, ${first}` : ""}</p>
          <h1 className="mt-3 text-[34px] font-semibold leading-[1.02] tracking-[-0.035em] md:text-[46px]">{headline}</h1>
          <p className="mt-4 max-w-[46ch] text-[16.5px] leading-relaxed opacity-90">
            {block ? (
              <>
                <b>{block.name}</b>
                {unlocked.length ? <> unlocks {unlocked.slice(0, 2).join(" and ")}</> : null} in <i className="font-read">{title}</i>.
                {" "}Ask the guide to explain it from the paper, then carry on reading.
              </>
            ) : isLoading ? "Loading your trail…" : map ? <>Every concept this paper needs is stamped. Read <i className="font-read">{title}</i> with the guide.</>
              : <>Open <i className="font-read">{title}</i> and ask the guide anything. Every answer cites the passage.</>}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button variant="sun" asChild>
              <Link href={block ? `/papers/${paper.id}?guide=1&ask=${encodeURIComponent(`Explain ${block.name} using this paper`)}` : `/papers/${paper.id}`}>
                {block ? `Learn ${shortTitle(block.name, 24)}` : "Continue reading"}
              </Link>
            </Button>
            <Button variant="onMoss" asChild><Link href={`/papers/${paper.id}?view=trail`}>See the whole trail</Link></Button>
          </div>
        </div>
        {stops.length > 1 ? <MiniTrail stops={stops.map((s) => ({ label: s.state === "current" ? `You · ${s.label}` : s.label, state: s.state }))} className="max-h-[260px]" /> : null}
      </div>
    </section>
  );
}

function ProcessingHero({ papers }: { papers: ShelfPaper[] }) {
  const busy = papers.find((p) => p.status === "processing");
  return (
    <section className="hero-surface relative overflow-hidden rounded-[28px] bg-moss px-6 py-10 text-moss-ink shadow-2 md:px-10">
      <Topo seed="processing" className="absolute inset-0 size-full" stroke="var(--moss-ink)" opacity={0.16} />
      <div className="relative max-w-xl">
        <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.03em] md:text-[40px]">
          {busy ? "Mapping your paper." : "Map a paper to start your trail."}
        </h1>
        <p className="mt-3 text-[16.5px] opacity-90">
          {busy ? <>We&apos;re splitting <i className="font-read">{busy.title}</i> into passages, finding its concepts and linking its references. This takes about a minute.</>
            : "Your papers below aren't mapped yet. Map one to get a guide, cited answers and a trail."}
        </p>
      </div>
    </section>
  );
}

function Tiles({ paperId }: { paperId?: string }) {
  const memory = useMemory();
  const resources = usePaperResources(paperId, 2);
  const upload = useUpload();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [weekAgo] = useState(() => Date.now() - 7 * 864e5);
  const knownWeek = (memory.data?.concepts ?? []).filter((c) => c.status === "known" && c.updated_at && Date.parse(c.updated_at) > weekAgo).length;
  const learning = (memory.data?.concepts ?? []).filter((c) => c.status === "learning").length;
  const pick = resources.data?.flatMap((g) => g.resources.map((r) => ({ ...r, concept: g.concept })))[0];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="flex items-center gap-4">
        <ProgressRing value={knownWeek + learning ? knownWeek / (knownWeek + learning) : 0} size={56} stroke={6} label="Concepts known this week" />
        <div>
          <Eyebrow>This week</Eyebrow>
          <p className="text-[17px] font-semibold">{knownWeek} concept{knownWeek === 1 ? "" : "s"} known</p>
          <p className="text-sm text-ink-2">{learning ? `${learning} more in progress.` : "Mark concepts as known while you read."}</p>
        </div>
      </Card>
      <Card>
        <Eyebrow>Picked for how you learn</Eyebrow>
        {pick ? (
          <>
            <a href={pick.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 line-clamp-2 block text-[17px] font-semibold hover:underline">{pick.title}</a>
            <p className="mt-1 text-sm text-ink-2">{pick.source}{pick.duration ? ` · ${pick.duration}` : ""} · {pick.concept}. <Link href="/resources" className="font-semibold text-moss-text">See your full plan →</Link></p>
          </>
        ) : (
          <p className="mt-1 text-sm text-ink-2">{resources.isLoading ? "Finding something for your next concept…" : <>Recommendations appear once a paper is mapped. <Link href="/resources" className="font-semibold text-moss-text">Resources →</Link></>}</p>
        )}
      </Card>
      <button type="button" onClick={() => input.current?.click()} className="rounded-xl border border-line bg-surface p-5 text-left shadow-1 transition-[transform,box-shadow] duration-[var(--t-med)] ease-spring hover:-translate-y-1 hover:shadow-2">
        <input ref={input} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f).then((id) => { if (id) router.push(`/papers/${id}`); }); e.target.value = ""; }} />
        <Eyebrow>Any field, any PDF</Eyebrow>
        <p className="text-[17px] font-semibold">Add a paper</p>
        <p className="text-sm text-ink-2">Drop a PDF anywhere on this page. We&apos;ll map it in about a minute.</p>
      </button>
    </div>
  );
}

function Shelf({ papers }: { papers: ShelfPaper[] }) {
  const [filter, setFilter] = useState<FieldKey | "all">("all");
  const fields = useMemo(() => {
    const m = new Map<FieldKey, number>();
    for (const p of papers) if (p.field) m.set(fieldKey(p.field), (m.get(fieldKey(p.field)) ?? 0) + 1);
    return [...m.keys()];
  }, [papers]);
  const shown = filter === "all" ? papers : papers.filter((p) => p.field && fieldKey(p.field) === filter);
  const n = fields.length;
  return (
    <section className="pt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Your library</Eyebrow>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em]">
            {n > 1 ? `${["", "", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"][n] ?? n} fields, one shelf` : `${papers.length} paper${papers.length === 1 ? "" : "s"} on your shelf`}
          </h2>
        </div>
        {n > 1 ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by field">
            <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>All</FilterPill>
            {fields.map((k) => (
              <FilterPill key={k} active={filter === k} onClick={() => setFilter(k)}>
                <span className="size-2 rounded-full" style={{ background: fieldVar(k) }} /> {FIELD_LABEL[k]}
              </FilterPill>
            ))}
          </div>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((p) => <PaperCard key={p.id} p={p} />)}
        <AddCard />
      </div>
    </section>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}
      className={cn("inline-flex h-9 items-center gap-2 rounded-pill border px-3.5 text-sm font-medium transition-colors",
        active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:border-line-2")}>
      {children}
    </button>
  );
}

function PaperCard({ p }: { p: ShelfPaper }) {
  const reingest = useReingest();
  const del = useDeletePaper();
  const removeJob = useJobs((s) => s.remove);
  const job = useJobs((s) => s.jobs.find((j) => j.paperId === p.id || j.key === p.id));
  const c = p.concepts;
  const pct = c && c.total ? Math.round((100 * c.known) / c.total) : 0;
  const body = (
    <>
      {p.status === "failed" ? (
        <div className="grid h-[132px] place-items-center bg-surface-2 text-ink-3"><AlertTriangle className="size-9" /></div>
      ) : (
        <FieldCover field={p.field ?? (p.status === "ready" ? null : undefined)} seed={p.id} label={Boolean(p.field)} className={p.status === "processing" ? "shimmer" : ""} />
      )}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <h3 className="font-read text-[18px] font-medium leading-snug">{p.title}</h3>
        <p className="mt-1 text-[13px] text-ink-3">{[p.authors?.slice(0, 3).join(", "), p.year, p.subfield].filter(Boolean).join(" · ") || p.field || " "}</p>
        <div className="mt-auto pt-3">
          {p.status === "ready" && c ? (
            <div className="flex items-center gap-2 text-[13px] text-ink-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-2">
                <span className="block h-full rounded-pill" style={{ width: `${pct}%`, background: fieldVar(fieldKey(p.field)) }} />
              </span>
              {pct === 100 ? "Done" : <>{pct}% · <span className="font-semibold text-new">{c.new} new</span></>}
            </div>
          ) : p.status === "processing" ? (
            <p className="rounded-[10px] bg-surface-2 px-3 py-2 text-[13px] text-ink-2" aria-live="polite">
              Mapping the paper{job?.stage ? <> · <b>{job.stage}</b></> : "…"}
            </p>
          ) : p.status === "failed" ? (
            <div className="space-y-2">
              <p className="rounded-[10px] bg-surface-2 px-3 py-2 text-[13px] text-ink-2"><AlertTriangle className="mr-1 inline size-3.5" />{p.error ?? "We couldn't map this PDF."}</p>
              <div className="flex gap-1.5">
                <Button size="sm" variant="sec" onClick={(e) => { e.preventDefault(); if (job) removeJob(job.key); }}>Dismiss</Button>
                {p.id && !p.id.includes(".pdf-") ? <Button size="sm" variant="ghost" onClick={(e) => { e.preventDefault(); del.mutate(p.id); }}><Trash2 /> Delete</Button> : null}
              </div>
            </div>
          ) : p.status === "unmapped" ? (
            <Button size="sm" variant="sec" loading={reingest.isPending} onClick={(e) => { e.preventDefault(); reingest.mutate({ id: p.id, title: p.title }); }}>
              <RefreshCw /> Map this paper
            </Button>
          ) : null}
        </div>
      </div>
    </>
  );
  const cls = cn("group flex flex-col overflow-hidden rounded-xl border bg-surface shadow-1 transition-[transform,box-shadow] duration-[var(--t-med)] ease-spring",
    p.status === "failed" ? "border-dashed border-f-psy/60" : "border-line", p.status === "ready" && "hover:-translate-y-1 hover:shadow-2");
  return p.status === "ready" || p.status === "unmapped"
    ? <Link href={`/papers/${p.id}`} className={cls}>{body}</Link>
    : <div className={cls}>{body}</div>;
}

function AddCard() {
  const upload = useUpload();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  return (
    <button type="button" onClick={() => input.current?.click()}
      className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line-2 text-center transition-colors hover:border-moss hover:bg-moss-soft/40">
      <input ref={input} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f).then((id) => { if (id) router.push(`/papers/${id}`); }); e.target.value = ""; }} />
      <span className="grid size-14 place-items-center rounded-[18px] bg-moss-soft text-moss-text"><Plus className="size-6" /></span>
      <span className="font-semibold">Add a paper</span>
      <span className="text-[13px] text-ink-3">or drop a PDF anywhere</span>
    </button>
  );
}

function TodaySkeleton() {
  return (
    <div className="mx-auto max-w-[1220px] space-y-5 px-4 pt-4 md:px-6" aria-busy>
      <Skeleton className="h-[340px] rounded-[28px]" />
      <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
    </div>
  );
}

function LoadError() {
  return (
    <div className="mx-auto max-w-xl px-4 pt-20 text-center">
      <h1 className="text-2xl font-semibold">We couldn&apos;t load your library.</h1>
      <p className="mt-2 text-ink-2">The server didn&apos;t answer. Check that the backend is running, then try again.</p>
      <Button className="mt-5" variant="pri" onClick={() => location.reload()}>Try again</Button>
    </div>
  );
}


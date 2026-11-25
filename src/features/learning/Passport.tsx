"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BookOpen, Check, ChevronDown, Search, X } from "lucide-react";
import { Button, Card, ConceptChip, Eyebrow, KIND, Segmented, Stamp, StateIcon, TextField, type ConceptState, type ResourceKind } from "@/components/atlas";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { memoryAPI, type Memory } from "@/lib/api/memory";
import { useLibrary, useMemory, useSetConcept } from "@/lib/data";
import { fieldKey, fieldVar, type FieldKey } from "@/lib/fields";
import { shortTitle } from "@/lib/trail";
import { usePrefs, type ExplainStyle } from "@/lib/prefs";
import { useOnboarding } from "@/features/onboarding/Onboarding";
import { cn } from "@/lib/utils";

const LEVELS: { value: NonNullable<Memory["depth"]>; label: string; hint: string }[] = [
  { value: "beginner", label: "New to the field", hint: "Explain terms and methods from scratch" },
  { value: "intermediate", label: "Some background", hint: "Explain field-specific methods" },
  { value: "expert", label: "Expert", hint: "Be concise, skip the basics" },
];
const EXPLAIN: { value: ExplainStyle; label: string; hint: string }[] = [
  { value: "intuition", label: "Intuition first", hint: "then the formal version" },
  { value: "formal", label: "Formal", hint: "precise from the start" },
  { value: "minimal", label: "Minimal", hint: "just enough to keep going" },
];

type LibConcept = {
  key: string; name: string; definition?: string | null; state: ConceptState; source?: string | null;
  updated?: string; papers: { id: string; title: string; field?: string | null }[];
};
type SetFn = (name: string, state: ConceptState) => void;

export function Passport() {
  const qc = useQueryClient();
  const memory = useMemory();
  const { papers } = useLibrary();
  const ready = useMemo(() => (papers ?? []).filter((p) => p.status === "ready"), [papers]);
  const perPaper = useQueries({ queries: ready.map((p) => ({ queryKey: ["paper-concepts", p.id], queryFn: () => memoryAPI.paperConcepts(p.id), staleTime: 30_000 })) });
  const setConcept = useSetConcept();
  const refresh = () => qc.invalidateQueries({ queryKey: ["memory"] });
  const forgetInterest = useMutation({ mutationFn: memoryAPI.forgetInterest, onSuccess: refresh });
  const stamp = perPaper.map((q) => q.dataUpdatedAt).join(",");

  // One entry per concept across every paper, with the reader's state and where it appears.
  const concepts = useMemo(() => {
    const byKey = new Map<string, LibConcept>();
    ready.forEach((p, i) => {
      for (const c of perPaper[i]?.data ?? []) {
        const e = byKey.get(c.key) ?? { key: c.key, name: c.name, definition: c.definition, state: c.status, papers: [] };
        if (!e.papers.some((x) => x.id === p.id)) e.papers.push({ id: p.id, title: p.title, field: p.field });
        byKey.set(c.key, e);
      }
    });
    for (const c of memory.data?.concepts ?? []) {
      const e = byKey.get(c.key) ?? { key: c.key, name: c.name, definition: c.definition, state: c.status, papers: [] };
      e.state = c.status; e.source = c.source; e.updated = c.updated_at;
      byKey.set(c.key, e);
    }
    return [...byKey.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memory.data, stamp, ready]);

  if (memory.isLoading) return <Wrap><Skeleton className="h-40" /><Skeleton className="mt-4 h-80 rounded-[28px]" /></Wrap>;
  if (memory.error || !memory.data) return <Wrap><p className="pt-10 text-ink-2">My learning isn&apos;t available right now. The server didn&apos;t answer; try again in a moment.</p></Wrap>;
  const m = memory.data;
  const count = (st: ConceptState) => concepts.filter((c) => c.state === st).length;
  const learning = concepts.filter((c) => c.state === "learning")
    .sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? ""));
  const recent = concepts.filter((c) => c.state === "known").sort((a, b) => (b.updated ?? "").localeCompare(a.updated ?? "")).slice(0, 8);
  const set: SetFn = (name, state) => setConcept.mutate({ name, state });

  return (
    <Wrap>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[640px]">
          <Eyebrow>My learning</Eyebrow>
          <h1 className="mt-1 text-[36px] font-semibold leading-[1.02] tracking-[-0.035em] md:text-[46px]">What you know, across every paper.</h1>
          <p className="mt-3 text-ink-2">The guide skips what you know and slows down on what you don&apos;t. Change any concept here and every paper, trail and recommendation follows.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat n={count("known")} label="known" color="text-known" />
          <Stat n={count("learning")} label="learning" color="text-learning" />
          <Stat n={count("new")} label="new to you" color="text-new" />
        </div>
      </div>

      {concepts.length === 0 ? (
        <Card className="mt-8 rounded-[var(--r-xl)] py-12 text-center">
          <p className="text-ink-2">Nothing here yet. Open a paper and mark the concepts you know; they&apos;ll gather here.</p>
          <Button className="mt-4" variant="pri" asChild><Link href="/today">Go to Today</Link></Button>
        </Card>
      ) : (
        <>
          {learning.length ? <LearningNow items={learning.slice(0, 6)} total={learning.length} onSet={set} /> : null}
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.15fr]">
            <ByField concepts={concepts} />
            <RecentStamps items={recent} onSet={set} />
          </div>
          <ConceptLibrary concepts={concepts} onSet={set} />
        </>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="rounded-[var(--r-lg)]">
          <h2 className="text-[18px] font-semibold">Interests</h2>
          <p className="text-sm text-ink-3">Picked up from your questions. Used to choose what comes after each paper.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {m.interests.length ? m.interests.map((i) => (
              <span key={i.name} className="inline-flex h-10 items-center gap-1 rounded-pill bg-surface-2 pl-4 pr-1.5 font-medium">
                {i.name}
                <button type="button" aria-label={`Remove interest ${i.name}`} onClick={() => forgetInterest.mutate(i.name)} className="grid size-7 place-items-center rounded-full text-ink-3 hover:bg-surface hover:text-ink"><X className="size-3.5" /></button>
              </span>
            )) : <p className="text-sm text-ink-2">None yet. Ask the guide a few questions and they&apos;ll appear here.</p>}
          </div>
        </Card>
        <ExplainCard key={m.field ?? ""} memory={m} onSaved={refresh} />
      </div>

      <PaceCard />
    </Wrap>
  );
}

function LearningNow({ items, total, onSet }: { items: LibConcept[]; total: number; onSet: SetFn }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-[20px] font-semibold tracking-[-0.02em]">Learning now {total > items.length ? <span className="text-ink-3">· {items.length} of {total}</span> : null}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => {
          const p = c.papers[0];
          return (
            <Card key={c.key} className="flex flex-col gap-2 rounded-[var(--r-lg)] p-4">
              <div className="flex items-start gap-2">
                <span className="mt-1 text-learning"><StateIcon state="learning" /></span>
                <h3 className="flex-1 text-[16px] font-semibold leading-snug">{c.name}</h3>
              </div>
              {c.definition ? <p className="line-clamp-2 font-read text-[14.5px] text-ink-2">{c.definition}</p> : null}
              {p ? <p className="truncate text-[12.5px] text-ink-3">In {shortTitle(p.title, 44)}{c.papers.length > 1 ? ` +${c.papers.length - 1}` : ""}</p> : null}
              <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                <Button size="sm" variant="pri" onClick={() => onSet(c.name, "known")}><Check /> I know it now</Button>
                {p ? <Button size="sm" asChild><Link href={`/papers/${p.id}`}>Open paper</Link></Button> : null}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ByField({ concepts }: { concepts: LibConcept[] }) {
  const rows = useMemo(() => {
    const m = new Map<string, { k: FieldKey; known: number; learning: number; new: number; label: string }>();
    for (const c of concepts) {
      const f = c.papers[0]?.field ?? null;
      const label = f ?? "Other";
      const r = m.get(label) ?? { k: fieldKey(f), known: 0, learning: 0, new: 0, label };
      r[c.state]++; m.set(label, r);
    }
    return [...m.values()].sort((a, b) => (b.known + b.learning + b.new) - (a.known + a.learning + a.new));
  }, [concepts]);
  return (
    <Card className="rounded-[var(--r-lg)]">
      <h2 className="text-[18px] font-semibold">By field</h2>
      <p className="text-sm text-ink-3">How much of each field&apos;s vocabulary you&apos;ve made your own.</p>
      <div className="mt-4 space-y-3">
        {rows.map((r) => {
          const total = r.known + r.learning + r.new;
          return (
            <div key={r.label}>
              <div className="mb-1 flex items-center gap-2 text-sm">
                <span className="size-2.5 rounded-full" style={{ background: fieldVar(r.k) }} />
                <span className="font-semibold">{r.label}</span>
                <span className="ml-auto text-ink-3">{r.known} of {total} known</span>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-pill bg-surface-2" role="img" aria-label={`${r.label}: ${r.known} known, ${r.learning} learning, ${r.new} new`}>
                <span className="bg-known" style={{ width: `${(100 * r.known) / total}%` }} />
                <span className="bg-learning" style={{ width: `${(100 * r.learning) / total}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex gap-4 text-[12.5px] text-ink-3">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-known" /> Known</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-learning" /> Learning</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-surface-2 ring-1 ring-line-2" /> New</span>
      </div>
    </Card>
  );
}

function RecentStamps({ items, onSet }: { items: LibConcept[]; onSet: SetFn }) {
  return (
    <Card className="rounded-[var(--r-lg)]">
      <h2 className="text-[18px] font-semibold">Recently stamped</h2>
      <p className="text-sm text-ink-3">Your latest known concepts. Tap one to change it.</p>
      {items.length ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {items.map((c) => (
            <StampPicker key={c.key} name={c.name} state="known" definition={c.definition} small onChange={(s) => onSet(c.name, s)} />
          ))}
        </div>
      ) : <p className="mt-4 text-sm text-ink-2">Mark a concept as known and its stamp lands here.</p>}
    </Card>
  );
}

function ConceptLibrary({ concepts, onSet }: { concepts: LibConcept[]; onSet: SetFn }) {
  const [q, setQ] = useState("");
  const [state, setState] = useState<"all" | ConceptState>("all");
  const [group, setGroup] = useState<"field" | "paper">("field");
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const g = new Map<string, { id: string; label: string; color?: string; items: LibConcept[] }>();
    for (const c of concepts) {
      if (state !== "all" && c.state !== state) continue;
      if (needle && !c.name.toLowerCase().includes(needle)) continue;
      const keys: [string, string, string | undefined][] = group === "paper"
        ? (c.papers.length ? c.papers.map((p) => [p.id, shortTitle(p.title, 70), undefined]) : [["none", "Not from a paper", undefined]])
        : [[c.papers[0]?.field ?? "Other", c.papers[0]?.field ?? "Other", fieldVar(fieldKey(c.papers[0]?.field))]];
      for (const [id, label, color] of keys) {
        const e = g.get(id) ?? { id, label, color, items: [] };
        e.items.push(c); g.set(id, e);
      }
    }
    return [...g.values()].sort((a, b) => b.items.length - a.items.length);
  }, [concepts, q, state, group]);
  const n = (s: ConceptState) => concepts.filter((c) => c.state === s).length;
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="mr-auto text-[20px] font-semibold tracking-[-0.02em]">All concepts <span className="text-ink-3">{concepts.length}</span></h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search concepts" aria-label="Search concepts"
            className="h-10 w-56 rounded-pill border border-line-2 bg-surface pl-9 pr-4 text-sm outline-none focus:border-moss focus:shadow-[0_0_0_5px_var(--moss-soft)]" />
        </div>
        <Segmented label="Filter by state" value={state} onChange={setState} options={[
          { value: "all", label: "All" }, { value: "known", label: `Known ${n("known")}` }, { value: "learning", label: `Learning ${n("learning")}` }, { value: "new", label: `New ${n("new")}` },
        ]} />
        <Segmented label="Group by" value={group} onChange={setGroup} options={[{ value: "field", label: "By field" }, { value: "paper", label: "By paper" }]} />
      </div>
      <div className="mt-4 space-y-3">
        {groups.length ? groups.map((g) => <Group key={`${group}-${g.id}`} label={g.label} color={g.color} items={g.items} onSet={onSet} />)
          : <p className="rounded-[var(--r)] bg-surface-2 p-4 text-sm text-ink-2">No concepts match. Clear the search or the filter.</p>}
      </div>
    </section>
  );
}

const ORDER: Record<ConceptState, number> = { learning: 0, new: 1, known: 2 };

function Group({ label, color, items, onSet }: { label: string; color?: string; items: LibConcept[]; onSet: SetFn }) {
  const [all, setAll] = useState(false);
  const sorted = [...items].sort((a, b) => ORDER[a.state] - ORDER[b.state] || a.name.localeCompare(b.name));
  const shown = all ? sorted : sorted.slice(0, 20);
  const known = items.filter((c) => c.state === "known").length;
  return (
    <details open className="group rounded-[var(--r-lg)] border border-line bg-surface shadow-1">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-5 py-3.5 [&::-webkit-details-marker]:hidden">
        {color ? <span className="size-2.5 shrink-0 rounded-full" style={{ background: color }} /> : <BookOpen className="size-4 shrink-0 text-ink-3" />}
        <span className="truncate font-semibold">{label}</span>
        <span className="shrink-0 text-sm text-ink-3">{known}/{items.length} known</span>
        <ChevronDown className="ml-auto size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
      </summary>
      <div className="flex flex-wrap gap-1.5 border-t border-line px-5 py-4">
        {shown.map((c) => (
          <ConceptChip key={c.key} name={c.name} state={c.state} definition={c.definition} onChange={(s) => onSet(c.name, s)} />
        ))}
        {items.length > 20 ? (
          <button type="button" onClick={() => setAll(!all)} className="h-[26px] rounded-pill px-3 text-[13px] font-semibold text-moss-text hover:bg-moss-soft">
            {all ? "Show fewer" : `Show all ${items.length}`}
          </button>
        ) : null}
      </div>
    </details>
  );
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return <div className="w-[110px] rounded-[var(--r)] border border-line bg-surface py-4 text-center shadow-1 md:w-[150px]"><p className={cn("text-[34px] font-semibold leading-none", color)}>{n}</p><p className="mt-1.5 text-[13px] text-ink-2">{label}</p></div>;
}

function StampPicker({ name, state, definition, sub, small, onChange }: { name: string; state: ConceptState; definition?: string | null; sub?: string; small?: boolean; onChange: (s: ConceptState) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><span><Stamp name={name} state={state} sub={sub} onClick={() => setOpen(true)} className={small ? "w-[104px] p-3.5 text-[11px]" : undefined} /></span></PopoverTrigger>
      <PopoverContent className="w-72 rounded-lg bg-surface p-4 shadow-2">
        <p className="font-semibold">{name}</p>
        {definition ? <p className="answer mt-1 text-[14.5px] text-ink-2">{definition}</p> : null}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {(["new", "learning", "known"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={state === s} onClick={() => { onChange(s); setOpen(false); }}
              className={cn("flex h-9 items-center justify-center gap-1 rounded-pill text-[13px] font-semibold",
                state === s ? (s === "known" ? "bg-known-soft text-known" : s === "learning" ? "bg-learning-soft text-learning" : "bg-new-soft text-new") : "bg-surface-2 text-ink-2")}>
              <StateIcon state={s} /> {s === "new" ? "New" : s === "learning" ? "Learning" : "Known"}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ExplainCard({ memory, onSaved }: { memory: Memory; onSaved: () => void }) {
  const { explain, set } = usePrefs();
  const [field, setField] = useState(memory.field ?? "");
  const save = async (patch: { field?: string; depth?: Memory["depth"] }) => {
    try { await memoryAPI.setPreferences({ field: field.trim() || undefined, depth: memory.depth, ...patch }); onSaved(); toast("Saved."); }
    catch { toast.error("Couldn't save. Try again."); }
  };
  return (
    <Card className="rounded-[var(--r-lg)]">
      <h2 className="text-[18px] font-semibold">How should the guide explain?</h2>
      <p className="text-sm text-ink-3">Your level is sent with every question; the style is used for recommendations.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {LEVELS.map((l) => (
          <Choice key={l.value} on={memory.depth === l.value} title={l.label} hint={l.hint} onClick={() => void save({ depth: l.value })} />
        ))}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {EXPLAIN.map((e) => <Choice key={e.value} on={explain === e.value} title={e.label} hint={e.hint} onClick={() => set({ explain: e.value })} />)}
      </div>
      <Button variant="ghost" size="sm" className="mt-2" onClick={() => useOnboarding.getState().setOpen(true)}>Redo onboarding</Button>
      <form className="mt-2 flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); void save({}); }}>
        <TextField label="Your field" value={field} onChange={(e) => setField(e.target.value)} placeholder="e.g. Labour economics, Immunology, Medieval history" className="mb-0 flex-1" />
        <Button type="submit" variant="sec">Save</Button>
      </form>
    </Card>
  );
}

function Choice({ on, title, hint, onClick }: { on: boolean; title: string; hint: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={cn("rounded-[var(--r)] border px-3.5 py-3 text-left transition-colors", on ? "border-moss bg-moss-soft" : "border-line bg-surface hover:border-line-2")}>
      <span className="block text-[15px] font-semibold">{title}</span>
      <span className="text-[13px] text-ink-2">{hint}</span>
    </button>
  );
}

function PaceCard() {
  const { sessionMinutes, formats, challenge, set } = usePrefs();
  const toggle = (k: ResourceKind) => set({ formats: formats.includes(k) ? formats.filter((f) => f !== k) : [...formats, k] });
  return (
    <Card id="pace" className="mt-5 scroll-mt-28 rounded-[var(--r-lg)]">
      <h2 className="text-[18px] font-semibold">Learning pace and format</h2>
      <p className="text-sm text-ink-3">Decides which resources you&apos;re shown and in what order. Changes apply straight away.</p>
      <div className="mt-5 grid gap-6 md:grid-cols-3">
        <div>
          <p className="mb-2 font-semibold">Time per session</p>
          <Segmented label="Time per session" value={String(sessionMinutes)} onChange={(v) => set({ sessionMinutes: Number(v) as 15 | 30 | 60 })}
            size="lg" options={[{ value: "15", label: "15 min" }, { value: "30", label: "30 min" }, { value: "60", label: "60 min" }]} />
        </div>
        <div>
          <p className="mb-2 font-semibold">Formats you like, in order</p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(KIND) as ResourceKind[]).map((k) => {
              const i = formats.indexOf(k); const I = KIND[k].icon;
              return (
                <button key={k} type="button" aria-pressed={i >= 0} onClick={() => toggle(k)}
                  className={cn("inline-flex h-9 items-center gap-1.5 rounded-pill border px-3 text-[14px] font-semibold transition-colors",
                    i >= 0 ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink hover:border-line-2")}>
                  <I className="size-3.5" /> {KIND[k].label}{i >= 0 ? <span className="text-xs opacity-70">{i + 1}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 font-semibold">Challenge</p>
          <Segmented label="Challenge" value={challenge} onChange={(v) => set({ challenge: v })} size="lg"
            options={[{ value: "gentle", label: "Gentle" }, { value: "balanced", label: "Balanced" }, { value: "push", label: "Push me" }]} />
        </div>
      </div>
      <Button size="sm" className="mt-5" asChild><Link href="/resources">See your recommendations →</Link></Button>
    </Card>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1220px] px-4 pb-16 pt-6 md:px-6">{children}</div>;
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, ConceptChip, KIND, ResourceCard, Segmented, Topo, kindOf, type AtlasResource, type ConceptState, type ResourceKind } from "@/components/atlas";
import { Skeleton } from "@/components/ui/skeleton";
import { useLastPaper, useLibrary, useMap, useMemory, usePaperResources, useSetConcept } from "@/lib/data";
import { usePrefs, type SavedResource } from "@/lib/prefs";
import { blockingConcept, buildTrail, shortTitle, unlocks } from "@/lib/trail";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import { syncResource } from "@/lib/prefsSync";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

const minutes = (d?: string | null) => { const m = d?.match(/(\d+)\s*min/); return m ? Number(m[1]) : null; };
const DEPTH: Record<string, string> = { beginner: "New to the field", intermediate: "Some background", expert: "Expert" };
const EXPLAIN = { intuition: "Intuition first", formal: "Formal", minimal: "Minimal" } as const;
const CHALLENGE = { gentle: "Gentle", balanced: "Balanced", push: "Push me" } as const;

export function ResourcesPage() {
  const { papers, isLoading: libLoading } = useLibrary();
  const last = useLastPaper((s) => s.id);
  const ready = (papers ?? []).filter((p) => p.status === "ready");
  const [chosen, setChosen] = useState<string | null>(null);
  const paper = ready.find((p) => p.id === chosen) ?? ready.find((p) => p.id === last) ?? ready[0];
  const { data: groups, isLoading, error } = usePaperResources(paper?.id, 6);
  const { data: map } = useMap(paper?.id);
  const memory = useMemory();
  const prefs = usePrefs();
  const setConcept = useSetConcept(paper?.id);
  const [tab, setTab] = useState<"plan" | "saved" | "done">("plan");
  // Saved / done / hidden live in the database once GET /v2/me/resources exists; the browser copy is the fallback.
  const server = useQuery({
    queryKey: ["my-resources"],
    queryFn: async () => {
      try { return (await api.get<(SavedResource & { state: "saved" | "done" | "hidden" })[]>("/v2/me/resources")).data; }
      catch { return null; }
    },
    staleTime: 60_000,
  });
  useEffect(() => {
    if (!server.data) return;
    usePrefs.getState().set({
      saved: server.data.filter((r) => r.state === "saved"),
      done: server.data.filter((r) => r.state === "done"),
      hidden: server.data.filter((r) => r.state === "hidden").map((r) => r.url),
    });
  }, [server.data]);
  const [formats, setFormats] = useState<ResourceKind[]>([]);
  const [length, setLength] = useState<"any" | "10" | "30" | "long">("any");

  const rank = (r: AtlasResource) => { const i = prefs.formats.indexOf(kindOf(r.kind)); return i === -1 ? 9 : i; };
  const keep = (r: AtlasResource) => {
    if (prefs.hidden.includes(r.url)) return false;
    if (formats.length && !formats.includes(kindOf(r.kind))) return false;
    const m = minutes(r.duration);
    if (length === "10" && !(m != null && m <= 10)) return false;
    if (length === "30" && !(m != null && m <= 30)) return false;
    if (length === "long" && !(m != null && m > 30)) return false;
    return true;
  };
  // Plan follows the trail: dependency order, so the concept in your way comes first.
  const order = useMemo(() => (map ? buildTrail(map).filter((s) => s.concept).map((s) => s.concept!.name.toLowerCase()) : []), [map]);
  const plan = useMemo(() => (groups ?? [])
    .map((g) => ({ ...g, all: g.resources.length, resources: g.resources.filter(keep).sort((a, b) => rank(a) - rank(b)).slice(0, 3) }))
    .sort((a, b) => {
      const ia = order.indexOf(a.concept.toLowerCase()), ib = order.indexOf(b.concept.toLowerCase());
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groups, formats, length, prefs.hidden, prefs.formats, order]);
  const block = map ? blockingConcept(map) : undefined;
  const heroGroup = plan.find((g) => g.concept.toLowerCase() === block?.name.toLowerCase()) ?? plan[0];
  const heroRes = heroGroup?.resources[0];

  const isSaved = (u: string) => prefs.saved.some((x) => x.url === u);
  const isDone = (u: string) => prefs.done.some((x) => x.url === u);
  const toRec = (r: AtlasResource): SavedResource => ({ url: r.url, title: r.title, kind: r.kind, source: r.source, why: r.why, duration: r.duration, concept: r.concept });
  const toggleSave = (r: AtlasResource) => {
    const on = !isSaved(r.url);
    prefs.set({ saved: on ? [...prefs.saved, toRec(r)] : prefs.saved.filter((x) => x.url !== r.url) });
    syncResource(toRec(r), on ? "saved" : "none", undefined, paper?.id);
    if (on) track({ type: "resource_saved", resource_url: r.url, concept: r.concept, paper_id: paper?.id, meta: { kind: r.kind, source: r.source } });
  };
  const toggleDone = (r: AtlasResource) => {
    if (isDone(r.url)) { prefs.set({ done: prefs.done.filter((x) => x.url !== r.url) }); syncResource(toRec(r), "none", undefined, paper?.id); return; }
    syncResource(toRec(r), "done", undefined, paper?.id);
    track({ type: "resource_done", resource_url: r.url, concept: r.concept, paper_id: paper?.id, meta: { kind: r.kind, source: r.source } });
    prefs.set({ done: [...prefs.done, toRec(r)], saved: prefs.saved.filter((x) => x.url !== r.url) });
    const g = groups?.find((x) => x.resources.some((y) => y.url === r.url));
    if (g && g.status === "new") setConcept.mutate({ name: g.concept, state: "learning" });
    toast(g ? `Nice. ${g.concept} is now in progress.` : "Marked done.", g?.status === "learning" ? { action: { label: "Mark known", onClick: () => setConcept.mutate({ name: g.concept, state: "known" }) } } : undefined);
  };
  const hide = (r: AtlasResource, reason: "easy" | "hard" | "useless") => {
    prefs.set({ hidden: [...prefs.hidden, r.url] });
    syncResource(toRec(r), "hidden", reason, paper?.id);
    track({ type: "resource_hidden", resource_url: r.url, concept: r.concept, paper_id: paper?.id, value: reason, meta: { kind: r.kind, source: r.source } });
    toast("Hidden. We'll show fewer like it.", { action: { label: "Undo", onClick: () => usePrefs.getState().set({ hidden: usePrefs.getState().hidden.filter((u) => u !== r.url) }) } });
  };
  const card = (r: AtlasResource, concept?: string, status?: string) => (
    <ResourceCard key={r.url} r={r} saved={isSaved(r.url)} done={isDone(r.url)} onSave={() => toggleSave(r)} onDone={() => toggleDone(r)} onHide={(reason) => hide(r, reason)}
      onOpen={() => track({ type: "resource_opened", resource_url: r.url, concept: r.concept ?? concept, paper_id: paper?.id, meta: { kind: r.kind, source: r.source } })}
      conceptChip={concept ? <ConceptChip size="sm" name={concept} state={(status as ConceptState) ?? "new"} onChange={(s) => setConcept.mutate({ name: concept, state: s })} /> : undefined} />
  );

  if (libLoading) return <Wrap><Skeleton className="h-64 rounded-[28px]" /></Wrap>;
  if (!paper) {
    return (
      <Wrap>
        <div className="rounded-[28px] border border-line bg-surface p-10 text-center shadow-1">
          <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Resources follow your trail.</h1>
          <p className="mx-auto mt-2 max-w-md text-ink-2">Map a paper first. We&apos;ll find videos, articles and reviews for each concept you still need, in the order you need them.</p>
          <Button className="mt-5" variant="pri" asChild><Link href="/today">Add a paper</Link></Button>
        </div>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <section className="relative overflow-hidden rounded-[28px] bg-moss p-6 text-moss-ink shadow-2 md:p-8">
          <Topo seed={`res-${paper.id}`} className="absolute inset-0 size-full" stroke="var(--moss-ink)" opacity={0.15} />
          <div className="relative">
            <p className="text-[13px] font-semibold opacity-80">Your next step · {shortTitle(paper.title)} trail</p>
            {block ? (
              <>
                <h1 className="mt-2 text-[30px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[38px]">{block.name} is the one thing in your way.</h1>
                {block.definition ? <p className="mt-2 max-w-[56ch] opacity-90">{block.definition}</p> : null}
                {map && unlocks(map, block).length ? (
                  <p className="mt-3 flex flex-wrap items-center gap-1.5 text-[13px] opacity-90">Unlocks next
                    {unlocks(map, block).slice(0, 3).map((u) => <span key={u} className="rounded-pill bg-moss-ink/15 px-2.5 py-0.5 font-semibold">{u}</span>)}
                  </p>
                ) : null}
              </>
            ) : <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.03em]">You know every concept this paper needs.</h1>}
            {heroRes ? (
              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[var(--r)] bg-moss-ink/10 p-3">
                <span className="grid size-11 place-items-center rounded-[12px]" style={{ background: KIND[kindOf(heroRes.kind)].color }}>
                  {(() => { const I = KIND[kindOf(heroRes.kind)].icon; return <I className="size-5 text-[#fff]" />; })()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{heroRes.title}</p>
                  <p className="truncate text-[13px] opacity-80">{KIND[kindOf(heroRes.kind)].label}{heroRes.duration ? ` · ${heroRes.duration}` : ""} · {heroRes.source}</p>
                </div>
                <Button variant="sun" asChild><a href={heroRes.url} target="_blank" rel="noopener noreferrer">Start{heroRes.duration ? ` · ${heroRes.duration}` : ""}</a></Button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-surface p-6 shadow-1">
          <h2 className="font-semibold">Matched to how you learn</h2>
          <dl className="mt-3 divide-y divide-line text-[14.5px]">
            {[["Level", prefs.level ?? DEPTH[memory.data?.depth ?? ""] ?? "Not set"], ["Explanations", EXPLAIN[prefs.explain]], ["Session length", `~${prefs.sessionMinutes} min`],
              ["Prefers", prefs.formats.map((f) => KIND[f].label.toLowerCase()).join(", ") || "Any"], ["Challenge", CHALLENGE[prefs.challenge]]].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 py-2.5"><dt className="text-ink-2">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
            ))}
          </dl>
          <Button size="sm" className="mt-3 w-full" asChild><Link href="/learning#pace">Change in My learning</Link></Button>
          {ready.length > 1 ? (
            <label className="mt-4 block text-[13px] text-ink-2">Trail for
              <select value={paper.id} onChange={(e) => setChosen(e.target.value)}
                className="mt-1 h-10 w-full rounded-[12px] border-[1.5px] border-line-2 bg-surface px-3 text-[14px] text-ink outline-none focus:border-moss">
                {ready.map((p) => <option key={p.id} value={p.id}>{shortTitle(p.title, 60)}</option>)}
              </select>
            </label>
          ) : null}
        </section>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Segmented label="Resource lists" value={tab} onChange={setTab} size="lg" options={[
          { value: "plan", label: <>Your plan <Count n={plan.length} sun /></> },
          { value: "saved", label: <>Saved <Count n={prefs.saved.length} /></> },
          { value: "done", label: <>Done <Count n={prefs.done.length} /></> },
        ]} />
      </div>

      {tab === "plan" ? (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[13px]">
            <span className="mr-1 text-ink-3">Format</span>
            {(Object.keys(KIND) as ResourceKind[]).map((k) => {
              const on = formats.includes(k); const I = KIND[k].icon;
              return <Pill key={k} on={on} onClick={() => setFormats(on ? formats.filter((x) => x !== k) : [...formats, k])}><I className="size-3.5" /> {KIND[k].label}</Pill>;
            })}
            <span className="ml-3 mr-1 text-ink-3">Length</span>
            {([["any", "Any"], ["10", "≤ 10 min"], ["30", "≤ 30 min"], ["long", "Longer"]] as const).map(([v, l]) => <Pill key={v} on={length === v} dark onClick={() => setLength(v)}>{l}</Pill>)}
            {formats.length || length !== "any" ? <button type="button" onClick={() => { setFormats([]); setLength("any"); }} className="ml-2 font-semibold text-moss-text">Clear filters</button> : null}
          </div>
          <p className="mt-4 text-sm text-ink-2">
            {plan.length} concept{plan.length === 1 ? "" : "s"} left on this trail, in the order they build on each other. Known concepts are skipped.
          </p>
          {isLoading ? <div className="mt-6 grid gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
            : error ? <p className="mt-6 rounded-[var(--r)] bg-surface-2 p-4 text-sm text-ink-2">Resource search isn&apos;t available on the server right now. Try again in a moment.</p>
            : (
              <ol className="relative mt-6 space-y-10 border-l-2 border-dotted border-line-2 pl-8">
                {plan.map((g, i) => {
                  const blocking = g.concept.toLowerCase() === block?.name.toLowerCase();
                  return (
                    <li key={g.concept} className="relative">
                      <span className={cn("absolute -left-[45px] top-0 grid size-7 place-items-center rounded-full border-2 text-[13px] font-bold",
                        blocking ? "border-sun bg-sun text-sun-ink" : g.status === "learning" ? "border-learning bg-surface text-learning" : "border-new bg-surface text-new")}>{i + 1}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[20px] font-semibold tracking-[-0.02em]">{g.concept}</h3>
                        <ConceptChip size="sm" name={g.status === "learning" ? "Learning" : "New to me"} state={g.status as ConceptState}
                          onChange={(s) => setConcept.mutate({ name: g.concept, state: s })} />
                        {blocking ? <span className="rounded-pill bg-sun-soft px-2.5 py-0.5 text-xs font-semibold text-sun-ink">Blocking you now</span> : null}
                      </div>
                      <p className="mt-0.5 text-[13px] text-ink-3">{g.role === "prerequisite" ? "Prerequisite for this paper" : "Core idea of this paper"}</p>
                      {g.resources.length ? (
                        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{g.resources.map((r) => card({ ...r, concept: g.concept }, g.concept, g.status))}</div>
                      ) : (
                        <p className="mt-3 rounded-[var(--r)] bg-sun-soft px-4 py-3 text-sm text-sun-ink">
                          {g.all ? "Your filters hide every resource for this concept. Clear a filter to see them." : "We couldn't find a good resource for this one."}{" "}
                          <Link href={`/papers/${paper.id}?ask=${encodeURIComponent(`Explain ${g.concept} using this paper`)}`} className="font-semibold underline">Ask the guide to explain it from the paper</Link>.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
        </>
      ) : (
        <div className="mt-6">
          {(tab === "saved" ? prefs.saved : prefs.done).length === 0 ? (
            <p className="rounded-[var(--r)] bg-surface-2 p-5 text-sm text-ink-2">
              {tab === "saved" ? "Nothing saved yet. Use the pin on a resource to queue it for later." : "Nothing finished yet. Tick a resource when you've done it and the concept moves to learning."}
            </p>
          ) : (
            <>
              {tab === "saved" ? <p className="mb-3 text-sm text-ink-2">{prefs.saved.length} saved · about {prefs.saved.reduce((a, r) => a + (minutes(r.duration) ?? 0), 0)} min</p> : null}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{(tab === "saved" ? prefs.saved : prefs.done).map((r) => card(r, r.concept))}</div>
            </>
          )}
        </div>
      )}
      <p className="mt-10 text-center text-[12.5px] text-ink-3">Resources come from YouTube, the web and OpenAlex. Each card shows its source.</p>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1220px] px-4 pb-16 pt-4 md:px-6">{children}</div>;
}
function Count({ n, sun }: { n: number; sun?: boolean }) {
  return <span className={cn("grid min-w-5 place-items-center rounded-pill px-1.5 text-xs font-bold", sun ? "bg-sun text-sun-ink" : "bg-surface-2 text-ink-2")}>{n}</span>;
}
function Pill({ on, dark, onClick, children }: { on: boolean; dark?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={cn("inline-flex h-8 items-center gap-1.5 rounded-pill border px-3 font-medium transition-colors",
        on ? (dark ? "border-ink bg-ink text-bg" : "border-moss bg-moss-soft text-moss-text") : "border-line bg-surface text-ink hover:border-line-2")}>
      {children}
    </button>
  );
}

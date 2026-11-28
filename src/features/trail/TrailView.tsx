"use client";

import { useMemo, useState } from "react";
import { Check, ExternalLink, Sparkles, X } from "lucide-react";
import { Button, ConceptChip, Eyebrow, ResourceCard, Segmented, Toggle, Topo, type ConceptState } from "@/components/atlas";
import { Skeleton } from "@/components/ui/skeleton";
import { useConceptResources, useMap } from "@/lib/data";
import { buildTrail, shortTitle, unlocks, type Stop, type Zone } from "@/lib/trail";
import { useGuide } from "@/features/guide/store";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import { TrailNetwork } from "./TrailNetwork";

const ZONES: { key: Zone; label: string }[] = [
  { key: "before", label: "Before" }, { key: "this", label: "This paper" }, { key: "after", label: "After" },
];

export function TrailView({ paperId, title, conceptState, onConcept }: {
  paperId: string; title: string; conceptState: (n: string) => ConceptState; onConcept: (n: string, s: ConceptState) => void;
}) {
  const [onlyNew, setOnlyNew] = useState(false);
  const [mode, setMode] = useState<"trail" | "network" | "list">("trail");
  const [selected, setSelected] = useState<Stop | null>(null);
  const { data: map, isLoading } = useMap(paperId);
  const all = useMemo(() => (map ? buildTrail(map, (c) => conceptState(c.name)) : []), [map, conceptState]);
  const stops = onlyNew ? all.filter((s) => s.kind !== "concept" || s.state !== "done") : all;
  const curIdx = all.findIndex((s) => s.state === "current");
  const sel = selected;
  const select = (st: Stop) => {
    setSelected(st);
    track({ type: "trail_stop_opened", paper_id: paperId, concept: st.concept?.name, value: st.zone });
  };

  if (isLoading) return <div className="mx-auto max-w-[1360px] space-y-4 px-4 py-6 md:px-6"><Skeleton className="h-12 w-96" /><Skeleton className="h-[520px] rounded-[28px]" /></div>;
  if (!map) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold">No trail yet.</h2>
        <p className="mt-2 text-ink-2">This paper hasn&apos;t been mapped, so we can&apos;t lay out what to learn before and after it. Open Read and choose “Map this paper”.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-40 pt-6 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Trail · {shortTitle(title)}</Eyebrow>
          <h1 className="text-[28px] font-semibold tracking-[-0.03em] md:text-[34px]">From the basics to the frontier</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle checked={onlyNew} onChange={setOnlyNew} label="Only new to me" />
          <Segmented label="Layout" value={mode} onChange={setMode} size="lg" options={[{ value: "trail", label: "Trail" }, { value: "network", label: "Network" }, { value: "list", label: "List" }]} />
        </div>
      </div>

      <JourneyBar stops={all} current={curIdx} />

      {mode !== "list" ? (
        <div key={mode} className="relative mt-4 animate-enter">
          {mode === "trail" ? (
            <TrailMap stops={stops} selected={sel?.id ?? null} onSelect={(sid) => { const st = stops.find((x) => x.id === sid); if (st) select(st); }} />
          ) : (
            <TrailNetwork map={map} stops={stops} selected={sel?.id ?? null} onSelect={select} conceptState={conceptState} />
          )}
          {sel ? <StopCard key={sel.id} stop={sel} map={map} conceptState={conceptState} onConcept={onConcept} onClose={() => setSelected(null)} /> : null}
        </div>
      ) : (
        <TrailList stops={stops} map={map} conceptState={conceptState} onConcept={onConcept} />
      )}
    </div>
  );
}

function JourneyBar({ stops, current }: { stops: Stop[]; current: number }) {
  const pos = current >= 0 ? current + 1 : stops.length;
  return (
    <div className="mt-4 flex items-center gap-3 rounded-[var(--r)] border border-line bg-surface px-4 py-3 shadow-1">
      <span className="shrink-0 font-semibold">Stop {pos} of {stops.length}</span>
      <div className="flex flex-1 gap-1" role="img" aria-label={`${stops.filter((s) => s.state === "done").length} stops done`}>
        {stops.map((s) => (
          <span key={s.id} title={s.label} className={cn("h-2 flex-1 rounded-pill",
            s.state === "done" ? "bg-moss" : s.state === "current" ? "bg-sun" : "bg-surface-2")} />
        ))}
      </div>
      <span className="hidden shrink-0 text-[13px] text-ink-3 sm:inline">{stops.filter((s) => s.kind === "concept" && s.state !== "done").length} concepts ahead</span>
    </div>
  );
}

function TrailMap({ stops, selected, onSelect }: { stops: Stop[]; selected: string | null; onSelect: (id: string) => void }) {
  const W = 1300, H = 540, pad = 70;
  const counts = ZONES.map((z) => Math.max(1, stops.filter((s) => s.zone === z.key).length));
  const total = counts.reduce((a, b) => a + b, 0);
  const zoneX: number[] = []; let acc = pad;
  for (const c of counts) { zoneX.push(acc); acc += ((W - 2 * pad) * c) / total; }
  zoneX.push(W - pad);
  const pts = stops.map((s, i) => {
    const z = ZONES.findIndex((x) => x.key === s.zone);
    const inZone = stops.filter((x) => x.zone === s.zone);
    const k = inZone.indexOf(s);
    const x = zoneX[z] + ((zoneX[z + 1] - zoneX[z]) * (k + 0.5)) / inZone.length;
    const y = H * 0.72 - (i / Math.max(1, stops.length - 1)) * H * 0.42 + Math.sin(i * 1.3) * 60;
    return { x, y };
  });
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => { const m = (a.x + b.x) / 2; return `C${m},${a.y} ${m},${b.y} ${b.x},${b.y}`; };
  const path = (from: number, to: number) => pts.slice(from, to + 1).map((p, i, arr) => (i ? seg(arr[i - 1], p) : `M${p.x},${p.y}`)).join(" ");
  const cur = Math.max(0, stops.findIndex((s) => s.state === "current"));
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface shadow-1">
      <Topo seed="trail-map" className="absolute inset-0 size-full text-line-2" opacity={0.6} rings={12} centers={5} />
      <svg viewBox={`0 0 ${W} ${H}`} className="relative block w-full" role="group" aria-label="Learning trail">
        {ZONES.map((z, i) => (
          <g key={z.key}>
            {i > 0 ? <line x1={zoneX[i]} y1="50" x2={zoneX[i]} y2={H - 40} stroke="var(--line-2)" strokeDasharray="4 6" /> : null}
            <text x={(zoneX[i] + zoneX[i + 1]) / 2} y="62" textAnchor="middle" fill="var(--ink-3)" fontSize="13" fontWeight="600" letterSpacing="3" fontFamily="var(--display)">{z.label.toUpperCase()}</text>
          </g>
        ))}
        <path d={path(0, stops.length - 1)} fill="none" stroke="var(--surface-2)" strokeWidth="22" strokeLinecap="round" />
        <path d={path(cur, stops.length - 1)} fill="none" stroke="var(--ink-3)" strokeWidth="3.5" strokeDasharray="1 11" strokeLinecap="round"
          style={{ animation: "fade-in .8s var(--ease) .6s backwards" }} />
        {cur > 0 ? <path d={path(0, cur)} fill="none" stroke="var(--moss)" strokeWidth="6" strokeLinecap="round"
          style={{ strokeDasharray: 4000, ["--len" as string]: 4000, animation: "draw 1.6s var(--ease) both" }} /> : null}
        {stops.map((s, i) => {
          const { x, y } = pts[i];
          const isSel = selected === s.id;
          return (
            <g key={s.id} transform={`translate(${x},${y})`} className="cursor-pointer" role="button" tabIndex={0}
              aria-label={`${s.label}: ${s.state === "done" ? "done" : s.state === "current" ? "you are here" : "ahead"}`}
              onClick={() => onSelect(s.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(s.id); } }}>
              {/* Stops land one after another along the path as it draws. */}
              <g style={{ animation: `pop .5s var(--spring) ${200 + i * 70}ms backwards`, transformBox: "fill-box", transformOrigin: "center" }}>
              {s.state === "current" ? (
                <g style={{ animation: "bob 2.4s ease-in-out infinite" }}>
                  <line x1="0" y1="-12" x2="0" y2="-62" stroke="var(--sun)" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M0,-62 l34,9 l-34,10 Z" fill="var(--sun)" />
                </g>
              ) : null}
              <circle r={isSel ? 17 : s.kind === "paper" ? 15 : 12}
                fill={s.state === "done" ? "var(--moss)" : s.state === "current" ? "var(--sun)" : s.kind === "paper" ? "var(--ink)" : "var(--surface)"}
                stroke={s.state === "ahead" && s.kind !== "paper" ? "var(--ink-3)" : "var(--surface)"} strokeWidth="3"
                style={{ transition: "r .35s var(--spring)" }} />
              {s.state === "done" ? <path d="M-5,0 l3.5,3.5 l6.5,-7" fill="none" stroke="var(--moss-ink)" strokeWidth="2.6" strokeLinecap="round" /> : null}
              <text y="34" textAnchor="middle" fill={s.state === "ahead" ? "var(--ink-2)" : "var(--ink)"} fontSize="14" fontWeight={s.state === "current" || s.kind === "paper" ? 700 : 600} fontFamily="var(--display)">
                {shortTitle(s.label, 22)}
              </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StopCard({ stop, map, conceptState, onConcept, onClose }: {
  stop: Stop; map: NonNullable<ReturnType<typeof useMap>["data"]>; conceptState: (n: string) => ConceptState;
  onConcept: (n: string, s: ConceptState) => void; onClose: () => void;
}) {
  const ask = useGuide((s) => s.ask);
  const c = stop.concept;
  const res = useConceptResources(c?.name);
  return (
    <div className="mt-4 rounded-[var(--r-lg)] border border-line bg-surface p-5 shadow-2 md:absolute md:right-5 md:top-5 md:mt-0 md:w-[380px] animate-pop" role="dialog" aria-label={stop.label}>
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-ink-2 hover:bg-surface-2"><X className="size-4" /></button>
      <Eyebrow>{stop.work ? (stop.zone === "before" ? "This paper builds on it" : "Came after · cites this paper")
        : stop.zone === "before" ? "Learn before" : stop.zone === "this" ? "In this paper" : "Came after"}</Eyebrow>
      {c ? (
        <>
          <h3 className="mt-0.5 pr-8 text-[20px] font-semibold tracking-[-0.02em]">{c.name}</h3>
          {c.definition ? <p className="answer mt-1.5 text-[15.5px] text-ink-2">{c.definition}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ConceptChip name={conceptState(c.name) === "known" ? "Known" : conceptState(c.name) === "learning" ? "Learning" : "New to me"}
              state={conceptState(c.name)} definition={c.definition} onChange={(s) => onConcept(c.name, s)} />
            {c.requires.length ? <span className="text-[13px] text-ink-3">Builds on {c.requires.join(", ")}</span> : null}
          </div>
          {unlocks(map, c).length ? <p className="mt-1.5 text-[13px] text-ink-3">Unlocks {unlocks(map, c).join(", ")}</p> : null}
          <div className="mt-4 flex gap-2">
            {conceptState(c.name) !== "known" ? <Button size="sm" variant="pri" onClick={() => onConcept(c.name, "known")}><Check /> I know this</Button> : null}
            <Button size="sm" onClick={() => ask(`Explain ${c.name} using this paper`)}><Sparkles /> Ask the guide</Button>
          </div>
          <p className="mt-5 text-[13px] font-semibold text-ink-2">Resources for this stop</p>
          <div className="mt-2 grid gap-3">
            {res.isLoading ? <Skeleton className="h-28" /> : res.data?.length
              ? res.data.slice(0, 2).map((r) => <ResourceCard key={r.url} r={r} />)
              : <p className="text-[13px] text-ink-3">No resources found. Ask the guide to explain it from the paper instead.</p>}
          </div>
        </>
      ) : stop.work ? (
        <>
          <h3 className="mt-0.5 pr-8 font-read text-[19px] font-medium leading-snug">{stop.work.title}</h3>
          <p className="mt-1 text-[13px] text-ink-3">{[stop.work.year, stop.work.cited_by ? `cited ${stop.work.cited_by.toLocaleString()} times` : null].filter(Boolean).join(" · ")}</p>
          {stop.work.url ? <Button size="sm" className="mt-4" asChild><a href={stop.work.url} target="_blank" rel="noopener noreferrer"><ExternalLink /> Open the paper</a></Button> : null}
        </>
      ) : (
        <>
          <h3 className="mt-0.5 pr-8 font-read text-[19px] font-medium leading-snug">{map.paper.title}</h3>
          <p className="mt-1 text-[13px] text-ink-3">{map.progress.known} of {map.progress.total} concepts known</p>
          <Button size="sm" variant="pri" className="mt-4" onClick={() => ask("What should I learn first?")}><Sparkles /> What should I learn first?</Button>
        </>
      )}
    </div>
  );
}

function TrailList({ stops, map, conceptState, onConcept }: {
  stops: Stop[]; map: NonNullable<ReturnType<typeof useMap>["data"]>; conceptState: (n: string) => ConceptState; onConcept: (n: string, s: ConceptState) => void;
}) {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-3">
      {ZONES.map((z) => (
        <section key={z.key} className="rounded-[var(--r-lg)] border border-line bg-surface p-5 shadow-1">
          <h2 className="text-[13px] font-semibold uppercase tracking-[.12em] text-ink-3">{z.label}</h2>
          <ol className="mt-3 space-y-3">
            {stops.filter((s) => s.zone === z.key).map((s) => (
              <li key={s.id} className="flex items-start gap-2.5">
                <span className={cn("mt-1 size-3 shrink-0 rounded-full", s.state === "done" ? "bg-moss" : s.state === "current" ? "bg-sun" : "border-2 border-ink-3")} aria-hidden />
                {s.concept ? (
                  <ConceptChip name={s.concept.name} state={conceptState(s.concept.name)} definition={s.concept.definition}
                    requires={s.concept.requires} onChange={(st) => onConcept(s.concept!.name, st)} />
                ) : s.work ? (
                  <span className="text-[14.5px]">
                    {s.work.url ? <a href={s.work.url} target="_blank" rel="noopener noreferrer" className="font-read hover:underline">{s.work.title}</a> : <span className="font-read">{s.work.title}</span>}
                    <span className="block text-[12.5px] text-ink-3">{[s.work.year, s.work.cited_by ? `cited ${s.work.cited_by.toLocaleString()}×` : null].filter(Boolean).join(" · ")}</span>
                  </span>
                ) : <span className="font-read text-[15px] font-medium">{map.paper.title}</span>}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

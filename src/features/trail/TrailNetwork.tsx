"use client";

import { useMemo, useState } from "react";
import type { LearningMapData, MapWork } from "@/lib/api/v2";
import { dedupeWorks, shortTitle, type Stop } from "@/lib/trail";
import type { ConceptState } from "@/components/atlas";
import { cn } from "@/lib/utils";

const W = 1300, H = 620, CX = W / 2, CY = H / 2;

type Node = {
  id: string; x: number; y: number; stop: Stop;
  kind: "paper" | "before" | "after" | "concept"; label: string; sub?: string; size: number;
  /** Outer-ring concepts label above the node, inner-ring below, so neighbours' labels don't collide. */
  above?: boolean;
  /** Label offset from the node centre (concepts), chosen so labels don't overlap. */
  labelY?: number;
};
type Edge = { id: string; from: string; to: string; kind: "cites" | "requires" | "uses" };

/** Bigger glyph for more-cited works, gently (log scale, capped). */
const workSize = (w: MapWork) => 1 + Math.min(0.7, Math.log10((w.cited_by ?? 0) + 1) / 7);

function layout(map: LearningMapData, stops: Stop[]) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const paperStop = stops.find((s) => s.kind === "paper")
    ?? { id: `paper:${map.paper.id}`, zone: "this", kind: "paper", label: shortTitle(map.paper.title), state: "ahead" } as Stop;
  const paperId = paperStop.id;
  nodes.push({ id: paperId, x: CX, y: CY, stop: paperStop, kind: "paper", label: shortTitle(map.paper.title, 30), sub: map.paper.year ? String(map.paper.year) : undefined, size: 1 });

  // References this paper builds on: an arc on the left. Later work citing it: an arc on the right.
  const side = (works: MapWork[], zone: "before" | "after") => {
    const list = dedupeWorks(works).slice(0, 8);
    list.forEach((w, k) => {
      const t = (k + 0.5) / list.length;
      const bulge = 80 * Math.sin(Math.PI * t);
      const x = zone === "before" ? 250 + bulge : W - 250 - bulge;
      const y = 70 + t * (H - 140);
      const id = `work:${w.id}`;
      const stop = stops.find((s) => s.id === id)
        ?? { id, zone, kind: "work", label: `${shortTitle(w.title)}${w.year ? ` (${w.year})` : ""}`, state: "ahead", work: w } as Stop;
      nodes.push({ id, x, y, stop, kind: zone, label: shortTitle(w.title, 28), sub: [w.year, w.cited_by ? `cited ${w.cited_by.toLocaleString()}×` : null].filter(Boolean).join(" · "), size: workSize(w) });
      edges.push(zone === "before" ? { id: `${paperId}>${id}`, from: id, to: paperId, kind: "cites" } : { id: `${id}>${paperId}`, from: paperId, to: id, kind: "cites" });
    });
  };
  side(map.before, "before");
  side(map.after, "after");

  // Concepts on an ellipse around the paper: prerequisites on the left half, the paper's own ideas on the right.
  const concepts = stops.filter((s) => s.kind === "concept" && s.concept);
  const place = (group: Stop[], from: number, to: number) => {
    group.forEach((s, k) => {
      const a = ((from + ((to - from) * (k + 0.5)) / group.length) * Math.PI) / 180;
      const outer = k % 2 === 1; // alternate rings so neighbouring nodes and labels don't collide
      const ring = outer ? 1.3 : 1;
      nodes.push({ id: s.id, x: CX + Math.cos(a) * 195 * ring, y: CY + Math.sin(a) * 165 * ring, stop: s, kind: "concept", label: shortTitle(s.label, 20), size: 1, above: outer });
      edges.push({ id: `${s.id}~${paperId}`, from: s.id, to: paperId, kind: "uses" });
    });
  };
  place(concepts.filter((s) => s.zone === "before"), 110, 250);
  place(concepts.filter((s) => s.zone !== "before"), -70, 70);
  placeLabels(nodes.filter((n) => n.kind === "concept"));
  const byName = new Map(concepts.map((s) => [s.concept!.name.toLowerCase(), s.id]));
  for (const s of concepts) {
    for (const r of s.concept!.requires) {
      const pre = byName.get(r.toLowerCase());
      if (pre && pre !== s.id) edges.push({ id: `${pre}=>${s.id}`, from: pre, to: s.id, kind: "requires" });
    }
  }
  return { nodes, edges, byId: new Map(nodes.map((n) => [n.id, n])) };
}

/**
 * Concept labels: try the preferred side, then the other side, then step further out, until the label's box
 * clears every label already placed. Boxes are estimated (about 7px per character at 12.5px).
 */
function placeLabels(list: Node[]) {
  type Box = { x0: number; x1: number; y0: number; y1: number };
  const placed: Box[] = [];
  const box = (n: Node, dy: number): Box => {
    const w = n.label.length * 7 + 6;
    return { x0: n.x - w / 2, x1: n.x + w / 2, y0: n.y + dy - 13, y1: n.y + dy + 4 };
  };
  const hits = (b: Box) => placed.some((p) => b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0);
  for (const n of list) {
    const first = n.above ? -20 : 30, second = n.above ? 30 : -20;
    const tries = [first, second, first + Math.sign(first) * 17, second + Math.sign(second) * 17, first + Math.sign(first) * 34];
    const dy = tries.find((t) => !hits(box(n, t))) ?? first;
    n.labelY = dy;
    placed.push(box(n, dy));
  }
}

const curve = (a: Node, b: Node) => {
  const mx = (a.x + b.x) / 2;
  return `M${a.x.toFixed(1)},${a.y.toFixed(1)} C${mx.toFixed(1)},${a.y.toFixed(1)} ${mx.toFixed(1)},${b.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
};

/**
 * The paper's neighbourhood as a network: the works it cites (left), the work that cites it (right), and the
 * concepts it rests on, with "builds on" links between them. Hover or focus a node to trace its links.
 */
export function TrailNetwork({ map, stops, selected, onSelect, conceptState }: {
  map: LearningMapData; stops: Stop[]; selected: string | null; onSelect: (s: Stop) => void; conceptState: (n: string) => ConceptState;
}) {
  const { nodes, edges, byId } = useMemo(() => layout(map, stops), [map, stops]);
  const [hot, setHot] = useState<string | null>(null);
  const focus = hot ?? selected;
  const near = useMemo(() => {
    if (!focus) return null;
    const s = new Set([focus]);
    for (const e of edges) if (e.from === focus || e.to === focus) { s.add(e.from); s.add(e.to); }
    return s;
  }, [focus, edges]);
  const lit = (e: Edge) => !!focus && (e.from === focus || e.to === focus);

  return (
    <div className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-1">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full min-w-[880px]" role="group" aria-label="Citation and concept network">
          <text x={250} y={34} textAnchor="middle" fill="var(--ink-3)" fontSize="12.5" fontWeight="600" letterSpacing="2.5" fontFamily="var(--display)">BUILDS ON</text>
          <text x={W - 250} y={34} textAnchor="middle" fill="var(--ink-3)" fontSize="12.5" fontWeight="600" letterSpacing="2.5" fontFamily="var(--display)">BUILT ON IT</text>

          <g fill="none" strokeLinecap="round">
            {edges.map((e, i) => {
              const a = byId.get(e.from), b = byId.get(e.to);
              if (!a || !b) return null;
              const on = lit(e);
              const dim = !!focus && !on;
              return (
                <path key={e.id} d={curve(a, b)} pathLength={1}
                  stroke={on ? "var(--ink)" : e.kind === "uses" ? "var(--line)" : "var(--line-2)"}
                  strokeWidth={on ? 2 : e.kind === "cites" ? 1.6 : 1.2}
                  strokeDasharray={e.kind === "requires" ? "0.012 0.014" : e.kind === "cites" ? 1 : undefined}
                  style={{
                    opacity: dim ? 0.18 : 1, transition: "opacity .3s var(--ease), stroke .3s var(--ease)",
                    ...(e.kind === "cites" ? { ["--len" as string]: 1, animation: `draw .9s var(--ease) ${120 + i * 30}ms backwards` } : {}),
                  }} />
              );
            })}
          </g>

          {nodes.map((n, i) => {
            const dim = !!near && !near.has(n.id);
            const isSel = selected === n.id;
            const name = n.stop.concept ? `${n.stop.concept.name}, concept, ${conceptState(n.stop.concept.name) === "known" ? "known" : conceptState(n.stop.concept.name) === "learning" ? "learning" : "new to you"}`
              : n.kind === "paper" ? `${map.paper.title}, this paper` : `${n.stop.work?.title ?? n.label}, ${n.kind === "before" ? "cited by this paper" : "cites this paper"}`;
            return (
              <g key={n.id} transform={`translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`} role="button" tabIndex={0} aria-label={name} aria-pressed={isSel}
                className="cursor-pointer outline-none [&:focus-visible_.ring]:opacity-100"
                style={{ opacity: dim ? 0.28 : 1, transition: "opacity .3s var(--ease)" }}
                onMouseEnter={() => setHot(n.id)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(n.id)} onBlur={() => setHot(null)}
                onClick={() => onSelect(n.stop)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(n.stop); } }}>
                <g style={{ animation: `pop .45s var(--spring) ${60 + i * 25}ms backwards`, transformBox: "fill-box", transformOrigin: "center" }}>
                  <circle r={n.kind === "paper" ? 40 : 22} fill="transparent" />{/* 44px hit area around small glyphs */}
                  <circle className="ring opacity-0 transition-opacity" r={n.kind === "paper" ? 40 : 22} fill="none" stroke="var(--moss)" strokeWidth="2.5" />
                  <NodeGlyph n={n} state={n.stop.concept ? conceptState(n.stop.concept.name) : undefined} selected={isSel} />
                </g>
                <NodeLabel n={n} strong={isSel || hot === n.id} />
              </g>
            );
          })}
        </svg>
      </div>
      <Legend />
    </div>
  );
}

function NodeGlyph({ n, state, selected }: { n: Node; state?: ConceptState; selected: boolean }) {
  if (n.kind === "paper") {
    return (
      <>
        {n.stop.state === "current" ? <circle r="36" fill="none" stroke="var(--sun)" strokeWidth="3" /> : null}
        <circle r="28" fill="var(--ink)" />
        <path d="M-8,-10 h12 l5,5 v15 h-17 z M4,-10 v5 h5" fill="none" stroke="var(--bg)" strokeWidth="1.8" strokeLinejoin="round" />
      </>
    );
  }
  if (n.kind === "concept") {
    const r = selected ? 13 : 10;
    const current = n.stop.state === "current";
    return (
      <>
        {current ? <circle r={r + 6} fill="none" stroke="var(--sun)" strokeWidth="3" /> : null}
        {state === "known" ? (
          <>
            <circle r={r} fill="var(--known)" stroke="var(--surface)" strokeWidth="2.5" />
            <path d="M-4,0 l3,3 l5.5,-6" fill="none" stroke="var(--surface)" strokeWidth="2.2" strokeLinecap="round" />
          </>
        ) : state === "learning" ? (
          <>
            <circle r={r} fill="var(--learning-soft)" stroke="var(--learning)" strokeWidth="2.2" />
            <path d={`M0,${-r} A${r},${r} 0 0 1 0,${r} Z`} fill="var(--learning)" />
          </>
        ) : (
          <circle r={r} fill="var(--surface)" stroke="var(--new)" strokeWidth="2.2" strokeDasharray="2.5 2.5" />
        )}
      </>
    );
  }
  // A work: a small page, sized by how often it's cited.
  const s = n.size * (selected ? 1.25 : 1);
  return (
    <g transform={`scale(${s.toFixed(2)})`}>
      <path d="M-7,-9 h9 l5,5 v13 h-14 z" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2,-9 v5 h5 M-4,0 h8 M-4,3.5 h8" fill="none" stroke="var(--ink-3)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

function NodeLabel({ n, strong }: { n: Node; strong: boolean }) {
  // Halo in the card colour keeps labels legible where they cross edges.
  const common = { fontFamily: "var(--display)", fill: strong ? "var(--ink)" : "var(--ink-2)", stroke: "var(--surface)", strokeWidth: 4, strokeLinejoin: "round" as const, paintOrder: "stroke" };
  if (n.kind === "paper") {
    return (
      <>
        <text y="52" textAnchor="middle" fontSize="15" fontWeight="700" {...common} fill="var(--ink)">{n.label}</text>
        {n.sub ? <text y="70" textAnchor="middle" fontSize="12.5" fontFamily="var(--display)" fill="var(--ink-3)">{n.sub}</text> : null}
      </>
    );
  }
  if (n.kind === "concept") {
    return <text y={n.labelY ?? (n.above ? -20 : 30)} textAnchor="middle" fontSize="12.5" fontWeight={strong ? 700 : 600} {...common}>{n.label}</text>;
  }
  const left = n.kind === "before";
  const x = left ? -18 * n.size : 18 * n.size;
  return (
    <>
      <text x={x} y="-1" textAnchor={left ? "end" : "start"} fontSize="13" fontWeight={strong ? 700 : 600} {...common}>{n.label}</text>
      {n.sub ? <text x={x} y="15" textAnchor={left ? "end" : "start"} fontSize="11.5" fontFamily="var(--display)" fill="var(--ink-3)">{n.sub}</text> : null}
    </>
  );
}

function Legend() {
  const item = "inline-flex items-center gap-2";
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-3 text-[12.5px] text-ink-2")} aria-label="Legend">
      <li className={item}><svg viewBox="-9 -11 18 22" className="h-4 w-3.5" aria-hidden><path d="M-7,-9 h9 l5,5 v13 h-14 z" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="1.6" /></svg>Paper (bigger = more cited)</li>
      <li className={item}><span className="size-3 rounded-full border-2 border-dashed border-new" aria-hidden />New to me</li>
      <li className={item}><span className="size-3 rounded-full border-2 border-learning bg-[linear-gradient(90deg,transparent_50%,var(--learning)_50%)]" aria-hidden />Learning</li>
      <li className={item}><span className="size-3 rounded-full bg-known" aria-hidden />Known</li>
      <li className={item}><span className="size-3 rounded-full border-[3px] border-sun" aria-hidden />You are here</li>
      <li className={item}><svg width="26" height="6" aria-hidden><path d="M1,3 H25" stroke="var(--ink-3)" strokeWidth="1.4" strokeDasharray="3 3" /></svg>Builds on</li>
      <li className="ml-auto hidden text-ink-3 md:block">Hover or tab to trace links · select for details</li>
    </ul>
  );
}

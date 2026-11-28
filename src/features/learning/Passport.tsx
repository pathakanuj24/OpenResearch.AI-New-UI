"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Button, Card, Eyebrow, type ConceptState } from "@/components/atlas";
import { Skeleton } from "@/components/ui/skeleton";
import { memoryAPI } from "@/lib/api/memory";
import { useLibrary, useMemory } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Journey } from "./Journey";
import type { BoardPaper } from "./cards";
import { CrossPaper, DueForReview } from "./Extras";

type LibConcept = {
  key: string; name: string; definition?: string | null; state: ConceptState; source?: string | null; verified?: boolean;
  updated?: string; papers: { id: string; title: string; field?: string | null }[];
};

export function Passport() {
  const memory = useMemory();
  const { papers } = useLibrary();
  const ready = useMemo(() => (papers ?? []).filter((p) => p.status === "ready"), [papers]);
  const perPaper = useQueries({ queries: ready.map((p) => ({ queryKey: ["paper-concepts", p.id], queryFn: () => memoryAPI.paperConcepts(p.id), staleTime: 30_000 })) });
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
      e.state = c.status; e.source = c.source; e.updated = c.updated_at; e.verified = c.verified;
      byKey.set(c.key, e);
    }
    return [...byKey.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memory.data, stamp, ready]);

  // Paper tabs on the board: each paper's known / total, using the reader's current states.
  const boardPapers = useMemo<BoardPaper[]>(() => ready.map((p) => {
    const inPaper = concepts.filter((c) => c.papers.some((x) => x.id === p.id));
    return { id: p.id, title: p.title, field: p.field, known: inPaper.filter((c) => c.state === "known").length, total: inPaper.length };
  }), [ready, concepts]);

  if (memory.isLoading) return <Wrap><Skeleton className="h-40" /><Skeleton className="mt-4 h-80 rounded-[28px]" /></Wrap>;
  if (memory.error || !memory.data) return <Wrap><p className="pt-10 text-ink-2">My learning isn&apos;t available right now. The server didn&apos;t answer; try again in a moment.</p></Wrap>;
  const count = (st: ConceptState) => concepts.filter((c) => c.state === st).length;

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
          <Journey papers={boardPapers} concepts={concepts} />
          <DueForReview concepts={concepts} />
          <CrossPaper concepts={concepts} />
        </>
      )}

    </Wrap>
  );
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return <div className="w-[110px] rounded-[var(--r)] border border-line bg-surface py-4 text-center shadow-1 md:w-[150px]"><p className={cn("text-[34px] font-semibold leading-none", color)}>{n}</p><p className="mt-1.5 text-[13px] text-ink-2">{label}</p></div>;
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1220px] px-4 pb-16 pt-6 md:px-6">{children}</div>;
}

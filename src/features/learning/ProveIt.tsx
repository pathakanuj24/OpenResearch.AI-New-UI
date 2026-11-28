"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Check, X } from "lucide-react";
import { Button, Stamp } from "@/components/atlas";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { memoryAPI } from "@/lib/api/memory";
import { toApiError } from "@/lib/api/errors";
import { shortTitle } from "@/lib/trail";
import { cn } from "@/lib/utils";

/** How a check ended: passed → verified stamp; self → stamped without (or despite) the check; learning → keep at it. */
export type ProveResult = "verified" | "self" | "learning" | "cancel";

const LETTERS = ["A", "B", "C", "D"];

/**
 * "Prove it": two quick multiple-choice questions written from the paper's own passages before a concept is stamped
 * Known. Each answer reveals the explanation and the cited passage. Skippable at every step.
 */
export function ProveIt({ open, concept, paper, onDone }: {
  open: boolean; concept: string; paper: { id: string; title: string }; onDone: (r: ProveResult) => void;
}) {
  const q = useQuery({
    queryKey: ["concept-check", paper.id, concept.toLowerCase()],
    queryFn: () => memoryAPI.checkConcept(paper.id, concept),
    enabled: open, staleTime: 30 * 60_000, retry: false,
  });
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>([]); // the board re-keys this dialog per concept, so state starts fresh

  const qs = q.data?.questions ?? [];
  const cur = qs[step];
  const choice = picked[step] ?? null;
  const finished = qs.length > 0 && step >= qs.length;
  const right = qs.filter((x, i) => picked[i] === x.answer).length;

  const pick = (i: number) => { if (choice === null) setPicked((p) => { const n = [...p]; n[step] = i; return n; }); };
  // Keys 1–4 (or A–D) answer; Enter moves on once answered.
  useEffect(() => {
    if (!open || !cur) return;
    const onKey = (e: KeyboardEvent) => {
      const i = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : "abcd".indexOf(e.key.toLowerCase());
      if (choice === null && i >= 0 && i < cur.choices.length) { e.preventDefault(); pick(i); }
      else if (choice !== null && e.key === "Enter") { e.preventDefault(); setStep((s) => s + 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cur, choice, step]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDone("cancel")}>
      {/* Header and actions stay put; the question scrolls when the screen is short. */}
      <DialogContent className="flex max-h-[min(92dvh,760px)] max-w-[560px] flex-col gap-0 rounded-[var(--r-xl)] bg-surface p-0" showCloseButton={false}>
        <div className="flex items-start gap-3 border-b border-line px-6 py-5">
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-[20px] font-semibold tracking-[-0.02em]">Prove it: {concept}</DialogTitle>
            <DialogDescription className="mt-0.5 text-[13.5px] text-ink-3">
              {qs.length === 1 ? "One quick question" : "Two quick questions"} from <i className="font-read">{shortTitle(paper.title, 44)}</i>.
              {qs.length === 1 ? " Get it right" : " Get both right"} for a verified stamp.
            </DialogDescription>
          </div>
          <button type="button" onClick={() => onDone("cancel")} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2"><X className="size-4" /></button>
        </div>

        <div className="min-h-[240px] flex-1 overflow-y-auto px-6 py-5">
          {q.isLoading ? <Writing /> : q.isError || !qs.length ? (
            <div className="py-6 text-center animate-enter">
              <p className="font-semibold">Couldn&apos;t write questions for this one.</p>
              <p className="mt-1 text-sm text-ink-2">{q.isError ? toApiError(q.error).message : "The paper doesn't say enough about it."} You can still stamp it yourself.</p>
            </div>
          ) : finished ? (
            <Result right={right} total={qs.length} concept={concept} />
          ) : cur ? (
            <div key={step} className="animate-enter">
              <div className="flex items-center gap-1.5" aria-label={`Question ${step + 1} of ${qs.length}`}>
                {qs.map((_, i) => (
                  <span key={i} className={cn("h-1.5 flex-1 rounded-pill transition-colors duration-[var(--t-med)]",
                    i < step ? (picked[i] === qs[i].answer ? "bg-known" : "bg-f-psy") : i === step ? "bg-moss" : "bg-surface-2")} />
                ))}
              </div>
              <p className="mt-4 font-read text-[17px] leading-snug">{cur.question}</p>
              <div className="stagger mt-4 grid gap-2" role="radiogroup" aria-label="Answers">
                {cur.choices.map((c, i) => {
                  const isRight = i === cur.answer, isPicked = i === choice, shown = choice !== null;
                  return (
                    <button key={i} type="button" role="radio" aria-checked={isPicked} disabled={shown} onClick={() => pick(i)}
                      className={cn("flex items-center gap-3 rounded-[var(--r)] border-[1.5px] px-3.5 py-2.5 text-left text-[14.5px] transition-[border-color,background-color,translate] duration-[var(--t-med)] ease-spring",
                        !shown && "border-line bg-bg hover:-translate-y-0.5 hover:border-moss",
                        shown && isRight && "border-known bg-known-soft",
                        shown && isPicked && !isRight && "border-f-psy bg-[color-mix(in_srgb,var(--f-psy)_10%,var(--surface))] animate-[shake_.4s_var(--ease)]",
                        shown && !isRight && !isPicked && "border-line opacity-55")}>
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold",
                        shown && isRight ? "bg-known text-surface" : shown && isPicked ? "bg-f-psy text-surface" : "bg-surface-2 text-ink-2")}>
                        {shown && isRight ? <Check className="size-3.5 animate-pop" strokeWidth={3} /> : shown && isPicked ? <X className="size-3.5" strokeWidth={3} /> : LETTERS[i]}
                      </span>
                      <span className="flex-1">{c}</span>
                    </button>
                  );
                })}
              </div>
              {choice !== null ? (
                <div className="mt-4 rounded-[var(--r)] bg-surface-2 p-3.5 animate-enter" aria-live="polite">
                  <p className="text-[14px]"><b>{choice === cur.answer ? "Right." : "Not quite."}</b> {cur.explanation}</p>
                  <Link href={`/papers/${paper.id}`} className="mt-2 flex items-start gap-2 rounded-[var(--r-sm)] bg-surface p-2.5 text-[13px] hover:bg-bg">
                    <span className="mt-0.5 grid size-[18px] shrink-0 -rotate-45 place-items-center rounded-[50%_50%_50%_3px] bg-sun text-[9px] font-bold text-sun-ink"><span className="rotate-45">✓</span></span>
                    <span className="min-w-0"><span className="font-semibold text-ink-2">{cur.source.section || "Paper"} · p. {cur.source.page}</span>
                      <span className="line-clamp-2 font-read text-ink-2">“{cur.source.quote}”</span></span>
                  </Link>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-line px-6 py-4">
          {finished && right === qs.length ? (
            <Button variant="pri" className="ml-auto" onClick={() => onDone("verified")}><Check /> Add to Known</Button>
          ) : finished ? (
            <>
              <Button variant="ghost" onClick={() => onDone("self")}>Stamp it anyway</Button>
              <Button variant="pri" className="ml-auto" onClick={() => onDone("learning")}><BookOpen /> Keep learning it</Button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => onDone("self")} className="text-[13.5px] font-semibold text-ink-2 underline-offset-2 hover:text-ink hover:underline">Skip the check and stamp it</button>
              {choice !== null ? (
                <Button variant="pri" className="ml-auto" onClick={() => setStep((s) => s + 1)}>{step + 1 < qs.length ? "Next question" : "See result"} <ArrowRight /></Button>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** While the questions are written: a page being scanned and pins landing on it. */
function Writing() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center" role="status">
      <div className="relative h-[86px] w-[68px] rounded-[10px] border-2 border-line-2 bg-bg" aria-hidden>
        {[16, 28, 40, 52, 64].map((y, i) => <span key={y} className="absolute left-2.5 h-1 rounded-pill bg-line-2" style={{ top: y, width: i % 2 ? 34 : 46 }} />)}
        <span className="absolute inset-x-1 top-2 h-[3px] rounded-pill bg-moss/70" style={{ animation: "scan 1.6s var(--ease) infinite" }} />
        {[{ x: 44, y: 22, d: 0 }, { x: 14, y: 46, d: 0.5 }, { x: 40, y: 60, d: 1 }].map((p) => (
          <span key={p.d} className="absolute grid size-3.5 -rotate-45 rounded-[50%_50%_50%_2px] bg-sun" style={{ left: p.x, top: p.y, animation: `drop 1.8s var(--spring) ${p.d}s infinite` }} />
        ))}
      </div>
      <p className="font-semibold">Reading the paper for good questions…</p>
      <p className="-mt-3 text-sm text-ink-3">Every question comes from a passage you can check.</p>
    </div>
  );
}

function Result({ right, total, concept }: { right: number; total: number; concept: string }) {
  const passed = right === total;
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center animate-enter" aria-live="polite">
      <Stamp name={concept.length > 22 ? concept.slice(0, 21) + "…" : concept} sub={passed ? "Verified" : `${right} of ${total}`} state={passed ? "known" : "learning"} className="pointer-events-none" />
      <p className="text-[18px] font-semibold">{passed ? "You know this one." : right ? "Nearly there." : "Worth another look."}</p>
      <p className="max-w-[40ch] text-sm text-ink-2">{passed ? `${total === 1 ? "Right" : "Both answers right"}. It gets a verified stamp in your passport.` : "Keep it in progress and try again later, or stamp it yourself if you're sure."}</p>
    </div>
  );
}

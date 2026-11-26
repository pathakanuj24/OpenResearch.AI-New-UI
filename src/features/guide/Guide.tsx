"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, Check, ChevronDown, Copy, RotateCcw, Sparkles, Square, SquarePen, X } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/auth/authStore";
import { ConceptChip, ResourceCard, Steps, type ConceptState } from "@/components/atlas";
import { Markdown } from "@/features/chat/Markdown";
import type { ResearchMessage, SourceData } from "@/features/chat/types";
import { useGuide } from "./store";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import { ensureOk, newRequestId, toApiError } from "@/lib/api/errors";
import { logger } from "@/lib/log";

const log = logger("guide");

export const SUGGESTIONS = ["What should I learn first?", "Explain the method in plain words", "How big is the effect?", "What are the limitations?"];

const storeKey = (paperId: string) => `openresearch-chat-${paperId}`;

/**
 * Warm the server's answer cache for the first suggestion chips, so tapping one answers instantly. Runs once per
 * paper per browser session, one request at a time, after the page has settled. Each answer reads the whole stream
 * (the server caches an answer only when it finishes).
 */
function prefetchSuggestions(paperId: string) {
  const flag = `openresearch-prefetch-${paperId}`;
  try { if (sessionStorage.getItem(flag)) return; sessionStorage.setItem(flag, "1"); } catch { return; }
  setTimeout(async () => {
    for (const q of SUGGESTIONS.slice(0, 2)) {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v2/chat`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Request-ID": newRequestId() },
          body: JSON.stringify({ id: `prefetch-${paperId}`, paperIds: [paperId],
            messages: [{ id: "q", role: "user", parts: [{ type: "text", text: q }] }] }),
        });
        await ensureOk(res);
        const reader = res.body?.getReader();
        while (reader && !(await reader.read()).done) { /* drain */ }
      } catch (err) {
        const e = toApiError(err);
        if (!e.isClientError) log.warn("Suggestion prefetch failed", e, { requestId: e.requestId, status: e.status });
        return;
      }
    }
  }, 2500);
}

/** One conversation per paper, kept in this browser so leaving the page doesn't lose it. */
export function useResearchChat(paperId: string) {
  const transport = useMemo(() => new DefaultChatTransport<ResearchMessage>({
    api: `${process.env.NEXT_PUBLIC_API_BASE_URL}/v2/chat`,
    headers: async (): Promise<Record<string, string>> => {
      const token = await auth.currentUser?.getIdToken();
      const h: Record<string, string> = { "X-Request-ID": newRequestId() };
      if (token) h.Authorization = `Bearer ${token}`;
      return h;
    },
    body: { paperIds: [paperId] },
  }), [paperId]);
  const [initial] = useState<ResearchMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(storeKey(paperId)) ?? "[]"); } catch { return []; }
  });
  const chat = useChat<ResearchMessage>({
    id: `paper-${paperId}`, transport, messages: initial,
    onError: (err) => log.error("Guide stream failed", err, { source: "guide", paperId }),
  });
  useEffect(() => { if (!initial.length) prefetchSuggestions(paperId); }, [paperId, initial.length]);
  useEffect(() => {
    if (chat.status !== "ready") return;
    try { localStorage.setItem(storeKey(paperId), JSON.stringify(chat.messages.slice(-40))); } catch { /* storage full or blocked */ }
  }, [chat.messages, chat.status, paperId]);
  return chat;
}

// ---------- text helpers ----------

const FOLLOW = /<followups>([\s\S]*?)(<\/followups>|$)/;
/** Answer text without the follow-ups block (also hides a half-streamed "<follow…" tag). */
export function answerText(raw: string) {
  const i = raw.indexOf("<followups");
  if (i >= 0) return raw.slice(0, i).trimEnd();
  const partial = raw.match(/<[a-z]{0,9}$/);
  return partial ? raw.slice(0, partial.index).trimEnd() : raw;
}
export function followups(raw: string): string[] {
  const m = raw.match(FOLLOW);
  if (!m || !m[2]) return []; // wait for the closing tag
  return m[1].split("|").map((q) => q.trim()).filter((q) => q.length > 3).slice(0, 3);
}

/** Reveals streamed text smoothly (word-ish pace), instead of the model's big chunks. */
/**
 * Types the answer out at a steady reading pace (about 240 characters a second, faster when a big chunk is waiting),
 * and keeps going after the stream ends. Answers that were already complete when they mounted (history) show at once.
 */
function useSmoothText(target: string, live: boolean): [string, boolean] {
  const [shown, setShown] = useState(() => (live ? 0 : target.length));
  const pos = useRef(shown);
  useEffect(() => {
    if (pos.current >= target.length) return;
    let raf = 0;
    const tick = () => {
      const backlog = target.length - pos.current;
      pos.current = Math.min(target.length, pos.current + Math.max(4, backlog / 90));
      setShown(Math.floor(pos.current));
      if (pos.current < target.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  if (shown >= target.length) return [target, false];
  let cut = shown;
  // Never stop inside a citation like "[1, 3]" or an inline formula "$...$".
  const open = target.lastIndexOf("[", cut);
  if (open > target.lastIndexOf("]", cut - 1) && cut - open < 12) cut = open;
  const head = target.slice(0, cut);
  if (((head.match(/(?<!\\)\$/g) ?? []).length) % 2) cut = head.lastIndexOf("$");
  let text = target.slice(0, cut);
  if (((text.match(/\*\*/g) ?? []).length) % 2) text += "**"; // close a bold that's still being typed
  return [text, true];
}

function useElapsed(running: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t0 = Date.now();
    const id = setInterval(() => setS(Math.floor((Date.now() - t0) / 1000)), 250);
    return () => { clearInterval(id); setS(0); };
  }, [running]);
  return s;
}

// ---------- panel ----------

export function Guide({ chat, onCite, conceptState, onConcept, onClose, className, paperId, paperTitle }: {
  chat: ReturnType<typeof useResearchChat>;
  onCite: (s: SourceData) => void;
  conceptState: (name: string) => ConceptState;
  onConcept: (name: string, s: ConceptState) => void;
  onClose: () => void;
  className?: string;
  paperId?: string;
  paperTitle?: string;
}) {
  const { messages, sendMessage, status, stop, error, regenerate, setMessages } = chat;
  const busy = status === "submitted" || status === "streaming";
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const take = useGuide((s) => s.take);
  const pending = useGuide((s) => s.pending);
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);

  const ask = (q: string) => {
    const t = q.trim(); if (!t || busy) return;
    track({ type: "question_asked", paper_id: paperId, value: t });
    stick.current = true;
    void sendMessage({ text: t });
  };

  // Questions asked from the ask bar, selection toolbar, ⌘K or Today's hero.
  useEffect(() => {
    if (!pending || busy) return;
    const q = take();
    if (q) ask(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending, busy]);

  // Follow the stream unless the reader scrolled up to read.
  useEffect(() => {
    const el = scroller.current; if (!el || !stick.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior: busy ? "auto" : "smooth" });
  });

  const send = () => { ask(input); setInput(""); if (area.current) area.current.style.height = "auto"; };
  const first = user?.displayName?.split(" ")[0];

  return (
    <aside aria-label="Guide" className={cn("flex min-h-0 flex-col bg-surface", className)}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="size-7 rounded-full bg-[radial-gradient(circle_at_35%_35%,var(--sun),var(--moss))]" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-tight">Guide</p>
          <p className="truncate text-xs text-ink-3">Every answer is pinned to the paper</p>
        </div>
        {messages.length ? (
          <button type="button" onClick={() => { stop(); setMessages([]); if (paperId) localStorage.removeItem(storeKey(paperId)); }}
            aria-label="New conversation" title="New conversation" className="grid size-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2">
            <SquarePen className="size-[17px]" />
          </button>
        ) : null}
        <button type="button" onClick={onClose} aria-label="Close guide" className="grid size-9 place-items-center rounded-full text-ink-2 hover:bg-surface-2"><X className="size-[18px]" /></button>
      </div>

      <div ref={scroller} onScroll={(e) => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}
        className="min-h-0 flex-1 space-y-7 overflow-y-auto px-4 py-5" aria-live="polite">
        {messages.length === 0 ? (
          <div className="space-y-4 pt-2">
            <p className="answer text-[17px]">
              Hi{first ? ` ${first}` : ""}. What would you like to understand{paperTitle ? <> about <i>{paperTitle}</i></> : ""}?
            </p>
            <p className="text-sm text-ink-2">I&apos;ll search the paper, check what you already know, and pin every claim to its passage.</p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => ask(s)} className="rounded-[14px] border border-line bg-bg px-3.5 py-2.5 text-left text-[14px] font-medium transition-colors hover:border-moss hover:bg-moss-soft/40">{s}</button>
              ))}
            </div>
          </div>
        ) : messages.map((m, i) => {
          const last = i === messages.length - 1;
          return (
            <Turn key={m.id} m={m} live={busy && last} last={last && !busy} onCite={onCite} conceptState={conceptState} onConcept={onConcept}
              onFollow={ask} onRetry={() => { stick.current = true; void regenerate(); }} />
          );
        })}
        {status === "submitted" && messages.at(-1)?.role === "user" ? <Working steps={[]} /> : null}
        {error ? (
          <div role="alert" className="flex items-center gap-3 rounded-[14px] bg-surface-2 px-3.5 py-2.5 text-sm">
            <span className="flex-1">That didn&apos;t go through: {error.message || "the server didn't answer"}.</span>
            <button type="button" onClick={() => void regenerate()} className="font-semibold text-moss-text">Try again</button>
          </div>
        ) : null}
      </div>

      <form className="border-t border-line p-3" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <div className="flex items-end gap-2 rounded-[22px] border border-line-2 bg-bg p-1.5 pl-4 transition-shadow focus-within:border-moss focus-within:shadow-[0_0_0_5px_var(--moss-soft)]">
          <textarea ref={area} value={input} rows={1} aria-label="Ask the guide"
            onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(160, e.target.scrollHeight)}px`; }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={messages.length ? "Ask a follow-up…" : "Ask anything about this paper…"}
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent py-2 text-[15px] outline-none placeholder:text-ink-3" />
          {busy ? (
            <button type="button" onClick={() => stop()} aria-label="Stop" className="grid size-9 place-items-center rounded-full bg-ink text-bg"><Square className="size-3.5" fill="currentColor" /></button>
          ) : (
            <button type="submit" disabled={!input.trim()} aria-label="Send" className="grid size-9 place-items-center rounded-full bg-moss text-moss-ink transition-opacity disabled:opacity-40"><ArrowUp className="size-4" /></button>
          )}
        </div>
        <p className="mt-1.5 text-center text-[11.5px] text-ink-3">Answers come only from this paper. Check the pins.</p>
      </form>
    </aside>
  );
}

/** Live status while the guide works: the current step and a seconds counter. */
function Working({ steps }: { steps: { label: string; status: string }[] }) {
  const s = useElapsed(true);
  const current = [...steps].reverse().find((x) => x.status === "running")?.label;
  return (
    <p className="flex items-center gap-2.5 text-[14px] text-ink-2">
      <span className="relative grid size-5 place-items-center">
        <span className="absolute size-5 rounded-full bg-sun/40" style={{ animation: "pulse-dot 1.2s ease-in-out infinite" }} />
        <span className="size-2 rounded-full bg-moss" />
      </span>
      <span className="truncate">{current ? `${current}…` : steps.length ? "Writing the answer…" : "Thinking…"}</span>
      <span className="ml-auto shrink-0 tabular-nums text-xs text-ink-3">{s}s</span>
    </p>
  );
}

function Turn({ m, live, last, onCite, conceptState, onConcept, onFollow, onRetry }: {
  m: ResearchMessage; live: boolean; last: boolean; onCite: (s: SourceData) => void;
  conceptState: (name: string) => ConceptState; onConcept: (name: string, s: ConceptState) => void;
  onFollow: (q: string) => void; onRetry: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const raw = m.parts.filter((p) => p.type === "text").map((p) => p.text).join("");
  const clean = answerText(raw);
  const [shown, revealing] = useSmoothText(clean, live);
  if (m.role === "user") {
    return <p className="ml-auto w-fit max-w-[88%] whitespace-pre-wrap rounded-[18px] rounded-br-md bg-surface-2 px-3.5 py-2 text-[15px]">{raw}</p>;
  }
  const steps = m.parts.flatMap((p, i) => (p.type === "data-agent-step" ? [{ id: p.id ?? String(i), ...p.data, detail: p.data.detail ?? undefined }] : []));
  const cites = m.parts.find((p) => p.type === "data-citations")?.data;
  const concepts = m.parts.find((p) => p.type === "data-concepts")?.data ?? [];
  const resources = m.parts.find((p) => p.type === "data-resources")?.data ?? [];
  const writing = live && !clean;
  const typing = live || revealing;
  const settled = !typing; // extras appear once the answer has finished typing
  const follow = settled ? followups(raw) : [];
  const totalMs = steps.reduce((a, s) => a + (s.ms ?? 0), 0);

  return (
    <div className="group space-y-3">
      {writing ? <Working steps={steps} /> : steps.length ? (
        <div>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
            className="flex items-center gap-1.5 text-[13px] font-medium text-ink-3 transition-colors hover:text-ink-2">
            <Sparkles className="size-3.5 text-moss-text" />
            Showed the work · {steps.length} step{steps.length > 1 ? "s" : ""}{totalMs ? ` · ${(totalMs / 1000).toFixed(1)}s` : ""}
            <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
          </button>
          {open ? <div className="mt-2 rounded-[14px] bg-bg px-3 py-2.5"><Steps steps={steps} /></div> : null}
        </div>
      ) : null}

      {shown ? (
        <div className="relative">
          <Markdown text={shown} sources={cites?.sources} onCite={onCite} />
          {typing ? <span className="ml-0.5 inline-block h-4 w-[3px] translate-y-0.5 animate-pulse rounded-full bg-moss" aria-hidden /> : null}
        </div>
      ) : null}

      {settled && cites?.cited.length ? (
        <div className="flex flex-wrap gap-1.5">
          {cites.cited.map((n) => {
            const s = cites.sources.find((x) => x.index === n);
            return s ? (
              <button key={n} type="button" onClick={() => onCite(s)} className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-bg px-2.5 py-1 text-xs text-ink-2 hover:border-line-2">
                <span className="grid size-4 -rotate-45 place-items-center rounded-[50%_50%_50%_3px] bg-sun text-[9px] font-bold text-sun-ink"><span className="rotate-45">{n}</span></span>
                p. {s.page}{s.section ? ` · ${s.section}` : ""}
              </button>
            ) : null;
          })}
        </div>
      ) : null}

      {settled && concepts.length ? (
        <div className="flex flex-wrap gap-1.5">
          {concepts.slice(0, 8).map((c) => (
            <ConceptChip key={c.name} name={c.name} definition={c.definition} requires={c.requires} state={conceptState(c.name)} onChange={(s) => onConcept(c.name, s)} size="sm" />
          ))}
        </div>
      ) : null}
      {settled && resources.length ? <div className="grid gap-3">{resources.slice(0, 3).map((r) => <ResourceCard key={r.url} r={r} />)}</div> : null}

      {settled && clean ? (
        <div className="flex items-center gap-1 text-ink-3">
          <button type="button" aria-label="Copy answer" title="Copy" onClick={() => { void navigator.clipboard.writeText(clean.replace(/\[(\d+(?:\s*[,;]\s*\d+)*)\]/g, "")); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="grid size-7 place-items-center rounded-lg hover:bg-surface-2 hover:text-ink">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}</button>
          {last ? <button type="button" aria-label="Try again" title="Try again" onClick={onRetry} className="grid size-7 place-items-center rounded-lg hover:bg-surface-2 hover:text-ink"><RotateCcw className="size-3.5" /></button> : null}
        </div>
      ) : null}

      {last && follow.length ? (
        <div className="flex flex-col items-start gap-1.5 pt-1">
          {follow.map((q) => (
            <button key={q} type="button" onClick={() => onFollow(q)}
              className="rounded-[14px] border border-line bg-bg px-3 py-1.5 text-left text-[13.5px] text-ink-2 transition-[transform,border-color] duration-[var(--t-med)] ease-spring hover:-translate-y-0.5 hover:border-moss hover:text-ink">
              {q}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

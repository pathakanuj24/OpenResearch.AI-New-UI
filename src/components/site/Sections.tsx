import Link from "next/link";
import { Button, FieldCover, MiniTrail, Stamp, Topo } from "@/components/atlas";
import { FIELD_LABEL, type FieldKey } from "@/lib/fields";

export const FIELDS: FieldKey[] = ["econ", "bio", "earth", "hist", "phys", "law", "psy"];

export function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="bg-[linear-gradient(transparent_58%,var(--sun-soft)_58%)] [box-decoration-break:clone]">{children}</span>;
}

export function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-hidden>
      <div className="rounded-[var(--r-lg)] border border-line bg-surface p-5 shadow-2">
        <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-ink-3">Economics · Autor, Dorn, Hanson · 2013</p>
        <p className="mt-2 font-read text-[16px] leading-relaxed text-ink-2">Because industries cluster geographically, a shock to one industry lands unevenly on places.</p>
        <p className="relative mt-2 rounded-[10px] bg-sun-soft px-2 py-1 font-read text-[16px] leading-relaxed">
          <span className="absolute -left-7 top-1.5 grid size-[22px] -rotate-45 place-items-center rounded-[50%_50%_50%_4px] bg-sun text-[11px] font-bold text-sun-ink"><span className="rotate-45">1</span></span>
          A $1,000 increase in{" "}
          {/* A concept term as the reader shows it: "new to me" highlighter under the words, not a floating badge. */}
          <span className="rounded-[4px] bg-[linear-gradient(transparent_58%,var(--new-soft)_58%)] font-medium text-new">import exposure</span>
          {" "}per worker reduces the manufacturing share of employment by about 0.6 percentage points.
        </p>
      </div>
      <div className="relative -mt-8 ml-auto w-[78%] rounded-[var(--r-lg)] border border-line bg-surface p-4 shadow-2">
        <p className="text-[12px] font-semibold text-ink-3">How big is the effect?</p>
        <p className="answer mt-1 text-[15px]">Each extra $1,000 of exposure cuts manufacturing&apos;s share of jobs by about 0.6 points over a decade
          <span className="mx-1 inline-grid size-[20px] -rotate-45 place-items-center rounded-[50%_50%_50%_4px] bg-sun align-[2px] text-[10px] font-bold text-sun-ink"><span className="rotate-45">1</span></span>.</p>
      </div>
      <div className="relative -mt-4 w-[72%] overflow-hidden rounded-[var(--r-lg)] bg-moss p-3 shadow-2">
        <MiniTrail labels={false} stops={[{ state: "done" }, { state: "done" }, { state: "done" }, { state: "current" }, { state: "ahead" }, { state: "ahead" }, { state: "ahead" }]} />
      </div>
    </div>
  );
}

export function FieldStrip() {
  return (
    <section className="mx-auto max-w-[1220px] px-4 md:px-6">
      <p className="text-center text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink-3">Built for every field, not just computer science</p>
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {FIELDS.map((k) => (
          <div key={k} className="overflow-hidden rounded-[var(--r)] border border-line bg-surface shadow-1">
            <FieldCover field={FIELD_LABEL[k]} seed={`strip-${k}`} label={false} height={64} />
            <p className="px-3 py-2 text-[13px] font-semibold">{FIELD_LABEL[k]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function WhyCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-[var(--r-lg)] border border-line bg-surface p-4 shadow-1">
        <div className="rounded-[var(--r)] bg-surface-2 p-4"><p className="rounded-[12px] bg-surface p-3 font-read text-[14.5px] shadow-1">Imports were instrumented with growth in eight other rich countries
          <span className="mx-1 inline-grid size-[18px] -rotate-45 place-items-center rounded-[50%_50%_50%_4px] bg-sun text-[9px] font-bold text-sun-ink"><span className="rotate-45">1</span></span>, which isolates the supply shock
          <span className="mx-1 inline-grid size-[18px] -rotate-45 place-items-center rounded-[50%_50%_50%_4px] bg-sun text-[9px] font-bold text-sun-ink"><span className="rotate-45">2</span></span>.</p></div>
        <h3 className="mt-4 text-[17px] font-semibold">Every claim, pinned to the page</h3>
        <p className="mt-1 text-sm text-ink-2">Answers cite the exact passage. One click scrolls the paper there and highlights it, so checking takes seconds.</p>
      </div>
      <div className="rounded-[var(--r-lg)] border border-line bg-surface p-4 shadow-1">
        <div className="rounded-[var(--r)] bg-moss p-3"><MiniTrail labels={false} stops={[{ state: "done" }, { state: "done" }, { state: "current" }, { state: "ahead" }, { state: "ahead" }, { state: "ahead" }]} /></div>
        <h3 className="mt-4 text-[17px] font-semibold">A trail, not a reading list</h3>
        <p className="mt-1 text-sm text-ink-2">What to read before this paper, in order, and the work it led to after. Hide everything you already know with one switch.</p>
      </div>
      <div className="rounded-[var(--r-lg)] border border-line bg-surface p-4 shadow-1">
        <div className="flex items-center justify-center gap-1 rounded-[var(--r)] bg-surface-2 py-3">
          <Stamp name="Regression" state="known" className="w-[92px] p-3 text-[10px]" />
          <Stamp name="Endogeneity" state="learning" className="w-[92px] p-3 text-[10px]" />
          <Stamp name="Shift-share" state="new" className="w-[92px] p-3 text-[10px]" />
        </div>
        <h3 className="mt-4 text-[17px] font-semibold">It remembers what you know</h3>
        <p className="mt-1 text-sm text-ink-2">Concepts you master get stamped, so explanations skip what&apos;s easy for you. You can see, edit and delete all of it.</p>
      </div>
    </div>
  );
}

export const STEPS = [
  ["Upload any paper", "Drop in a PDF. We find its field, split it into passages and pick out the concepts."],
  ["Read with a guide", "Ask anything. Every answer is pinned to the passage it came from, and you see each step the guide took."],
  ["Follow your trail", "See what to learn first and where to go next, minus what you already know."],
] as const;

export function Steps3() {
  return (
    <ol className="grid gap-8 md:grid-cols-3">
      {STEPS.map(([t, d], i) => (
        <li key={t}>
          <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full border-2 border-moss text-[17px] font-semibold text-moss-text">{i + 1}</span>
            {i < 2 ? <span className="hidden h-0.5 flex-1 border-t-2 border-dotted border-line-2 md:block" /> : null}</div>
          <h3 className="mt-4 text-[17px] font-semibold">{t}</h3>
          <p className="mt-1 text-sm text-ink-2">{d}</p>
        </li>
      ))}
    </ol>
  );
}

export const FAQ = [
  ["Which fields does it work for?", "Every academic field: medicine, law, history, physics, economics, the arts and computer science are all treated the same. When you upload, OpenResearch identifies the paper's field, subfield and type, and adapts its vocabulary to it."],
  ["Where do the answers come from?", "Only from your paper. The guide searches its passages, and every claim carries a pin to the passage it came from. When the paper doesn't say, the guide tells you instead of guessing."],
  ["Who can see the papers I upload?", "Only you. Your papers, trails and notes are private to your account. Shared knowledge, like what a concept means, is never linked back to you."],
  ["Can I see and delete what it remembers about me?", "Yes. My learning shows every concept, interest and session note the guide keeps. Change or delete any of it, or erase it all from Settings."],
  ["Does it work with scanned PDFs?", "Not yet. It needs a PDF with a text layer. If a paper is a scanned image, run it through OCR first or download the publisher's text version."],
] as const;

export function Faq() {
  return (
    <div className="max-w-[720px] divide-y divide-line border-y border-line">
      {FAQ.map(([q, a], i) => (
        <details key={q} open={i === 0} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold">
            {q}<span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-sm transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-2 text-[15px] text-ink-2">{a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto mt-24 max-w-[1220px] px-4 md:px-6">
      <div className="hero-surface relative overflow-hidden rounded-[28px] bg-moss px-8 py-12 text-moss-ink md:flex md:items-center md:justify-between md:px-12">
        <Topo seed="cta" className="absolute inset-0 size-full" stroke="var(--moss-ink)" opacity={0.16} />
        <div className="relative">
          <h2 className="text-[30px] font-semibold tracking-[-0.03em] md:text-[38px]">Your next paper will be easier than your last.</h2>
          <p className="mt-2 opacity-90">Upload a PDF from any field and get a guide, a trail and cited answers in about a minute.</p>
        </div>
        <Button variant="sun" className="relative mt-6 md:mt-0" asChild><Link href="/signup">Start reading free</Link></Button>
      </div>
    </section>
  );
}

export function PageHero({ eyebrow, title, lede }: { eyebrow: string; title: React.ReactNode; lede: string }) {
  return (
    <section className="mx-auto max-w-[1220px] px-4 pb-10 pt-14 md:px-6">
      <p className="text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink-3">{eyebrow}</p>
      <h1 className="mt-2 max-w-[18ch] text-[40px] font-semibold leading-[1.02] tracking-[-0.035em] md:text-[56px]">{title}</h1>
      <p className="mt-4 max-w-[60ch] text-[18px] text-ink-2">{lede}</p>
    </section>
  );
}

import { CtaBand, Faq, PageHero, Steps3 } from "@/components/site/Sections";

export const metadata = { title: "How it works" };

const DETAIL = [
  ["1 · We map the paper", "Your PDF is split into sections and passages. We identify its field, pick out the concepts it uses and introduces, work out which concepts build on which, and link its references to the scholarly record (OpenAlex and Crossref)."],
  ["2 · You read with Iris", "Ask a question and Iris searches the paper's passages by meaning and by exact terms, follows the concept graph, and answers only from what it finds. Every claim gets a sun-yellow pin; click it and the paper scrolls to the passage and highlights it."],
  ["3 · You follow your trail", "The trail orders what to learn before the paper and shows the work that built on it. Mark concepts as known and they disappear from the trail, Iris skips them, and resources focus on what's left."],
] as const;

export default function HowItWorks() {
  return (
    <>
      <PageHero eyebrow="How it works" title="From PDF to understanding in three steps." lede="Most papers are mapped in about a minute. Here is what happens along the way." />
      <section className="mx-auto max-w-[1220px] px-4 md:px-6">
        <Steps3 />
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {DETAIL.map(([t, d]) => (
            <div key={t} className="rounded-[var(--r-lg)] border border-line bg-surface p-6 shadow-1">
              <h2 className="text-[18px] font-semibold">{t}</h2>
              <p className="mt-2 text-[15px] text-ink-2">{d}</p>
            </div>
          ))}
        </div>
        <h2 className="mb-6 mt-20 text-[34px] font-semibold tracking-[-0.035em]">Questions</h2>
        <Faq />
      </section>
      <CtaBand />
    </>
  );
}

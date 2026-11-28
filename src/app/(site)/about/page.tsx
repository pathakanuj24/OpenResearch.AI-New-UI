import { CtaBand, PageHero } from "@/components/site/Sections";

export const metadata = { title: "About" };

export default function About() {
  return (
    <>
      <PageHero eyebrow="About" title="Anyone can understand any research paper." lede="Research papers are written for insiders. We're building the patient expert every reader deserves, in every field." />
      <section className="mx-auto max-w-[760px] space-y-6 px-4 font-read text-[18.5px] leading-[1.78] md:px-6">
        <p>A biology student opening an economics paper, a new PhD student in a neighbouring subfield, a clinician reading their first econometrics study: they all hit the same wall. Unfamiliar vocabulary, methods they&apos;ve never seen, and hundreds of references with no clue which ones matter.</p>
        <p>Insightway sits beside the paper. It explains it in your terms, points to the exact passage behind every claim, maps what you need to learn before and after it, and remembers what you already know, so each paper is easier than the last.</p>
        <h2 id="privacy" className="scroll-mt-24 pt-6 font-display text-[24px] font-semibold tracking-[-0.02em]">Privacy</h2>
        <p>Your papers, trails and notes are visible only to you. We use them to answer your questions and build your trail, nothing else. You can delete any paper, any memory, or your whole account from Settings.</p>
        <h2 id="terms" className="scroll-mt-24 pt-6 font-display text-[24px] font-semibold tracking-[-0.02em]">Terms</h2>
        <p>Upload only papers you have the right to read. Answers are generated from the paper and can be wrong; the pins are there so you can check every claim against the source.</p>
      </section>
      <CtaBand />
    </>
  );
}

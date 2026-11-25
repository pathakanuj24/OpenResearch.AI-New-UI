import Link from "next/link";
import { Button } from "@/components/atlas";
import { CtaBand, Faq, FieldStrip, Highlight, HeroIllustration, Steps3, WhyCards } from "@/components/site/Sections";

export default function Home() {
  return (
    <>
      <section className="mx-auto grid max-w-[1220px] items-center gap-12 px-4 pb-16 pt-12 md:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-2 py-1 text-[13px] font-medium text-ink-2">
            <span className="rounded-pill bg-moss-soft px-2 text-xs font-semibold text-moss-text">New</span> Cited answers for every field
          </span>
          <h1 className="mt-5 text-[44px] font-semibold leading-[1.0] tracking-[-0.04em] md:text-[66px]">
            Understand any research paper. <Highlight>Know what to learn next.</Highlight>
          </h1>
          <p className="mt-5 max-w-[52ch] text-[19px] text-ink-2">
            OpenResearch reads alongside you. It explains the paper in your terms, pins every claim to the passage it came from, and lays out a trail from what you need first to where the field went next.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Button variant="pri" asChild><Link href="/signup">Start reading free</Link></Button>
            <Button asChild><Link href="/how-it-works">See how it works</Link></Button>
          </div>
          <p className="mt-3 text-[13px] text-ink-3">Works with any text PDF, in any field.</p>
        </div>
        <HeroIllustration />
      </section>
      <FieldStrip />
      <section className="mx-auto mt-24 max-w-[1220px] px-4 md:px-6">
        <p className="text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink-3">Why readers stay</p>
        <h2 className="mt-2 max-w-[20ch] text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] md:text-[42px]">An expert from the field, sitting next to you.</h2>
        <p className="mb-8 mt-3 max-w-[60ch] text-[17px] text-ink-2">The first hour with a hard paper is the worst. OpenResearch makes it as productive as an hour with a patient expert.</p>
        <WhyCards />
      </section>
      <section className="mx-auto mt-24 max-w-[1220px] px-4 md:px-6">
        <p className="text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink-3">How it works</p>
        <h2 className="mt-2 max-w-[20ch] text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] md:text-[42px]">Three steps from PDF to understanding.</h2>
        <p className="mb-10 mt-3 text-[17px] text-ink-2">Most papers are mapped in about a minute.</p>
        <Steps3 />
        <Button size="sm" className="mt-8" asChild><Link href="/how-it-works">See it step by step →</Link></Button>
      </section>
      <section className="mx-auto mt-24 max-w-[1220px] px-4 md:px-6">
        <p className="text-[12.5px] font-semibold uppercase tracking-[.08em] text-ink-3">Questions</p>
        <h2 className="mb-6 mt-2 text-[34px] font-semibold tracking-[-0.035em] md:text-[42px]">Good to know.</h2>
        <Faq />
      </section>
      <CtaBand />
    </>
  );
}

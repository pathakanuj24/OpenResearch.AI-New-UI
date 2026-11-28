import { BookOpen, Brain, Library, MessageCircleQuestion, Route, ShieldCheck } from "lucide-react";
import { CtaBand, PageHero, WhyCards } from "@/components/site/Sections";

export const metadata = { title: "Features" };

const FEATURES = [
  [BookOpen, "A calm reading view", "The paper in a comfortable reading font, with the concepts you don't know yet marked and defined in place."],
  [MessageCircleQuestion, "Iris shows its work", "Ask anything. Iris searches the paper, checks what you know and looks up references, and you can see each step."],
  [Route, "Your trail", "Prerequisites in the order they build on each other, this paper, then the most-cited work that came after."],
  [Brain, "Memory you control", "Mark concepts new, learning or known. Iris adapts; you can see, change or erase everything it keeps."],
  [Library, "Resources with reasons", "Videos, articles and reviews for the concept in your way, each with its source and why it was picked."],
  [ShieldCheck, "Private by default", "Your papers and notes are visible only to you. Delete a paper or your whole account at any time."],
] as const;

export default function Features() {
  return (
    <>
      <PageHero eyebrow="Features" title="Everything you need to understand a paper." lede="Built for readers in every field: medicine, law, history, physics, economics, the arts and computer science." />
      <section className="mx-auto max-w-[1220px] px-4 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(([Icon, t, d]) => (
            <div key={t} className="rounded-[var(--r-lg)] border border-line bg-surface p-6 shadow-1 transition-[transform,box-shadow] duration-[var(--t-med)] ease-spring hover:-translate-y-1 hover:shadow-2">
              <span className="grid size-11 place-items-center rounded-[14px] bg-moss-soft text-moss-text"><Icon className="size-5" /></span>
              <h2 className="mt-4 text-[18px] font-semibold">{t}</h2>
              <p className="mt-1 text-[15px] text-ink-2">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-16"><WhyCards /></div>
      </section>
      <CtaBand />
    </>
  );
}

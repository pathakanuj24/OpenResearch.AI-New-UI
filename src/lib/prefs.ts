"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Reader display preferences and learning-style choices that the backend doesn't store yet.
 * Kept per browser (see docs/frontend-api-contract.md for the endpoint that will replace this).
 */
export type ExplainStyle = "intuition" | "formal" | "minimal";
export type Format = "video" | "article" | "interactive" | "course" | "paper";
export type SavedResource = { url: string; title: string; kind: string; source: string; why?: string | null; duration?: string | null; concept?: string };

type Prefs = {
  textScale: number; // 0.9 … 1.2, applied to reading text
  reduceMotion: boolean;
  explain: ExplainStyle;
  sessionMinutes: 15 | 30 | 60;
  formats: Format[]; // in order of preference
  challenge: "gentle" | "balanced" | "push";
  saved: SavedResource[];
  done: SavedResource[];
  hidden: string[]; // resource URLs marked "Not useful"
  level: string | null; // onboarding answer, e.g. "Master's student" (backend stores the coarser depth)
  onboardingSkipped: boolean;
  personalise: boolean; // send reading activity to the server for recommendations
  readerMode: "text" | "pdf";
  proveIt: boolean; // ask two quick questions before a concept is stamped Known
  set: (p: Partial<Omit<Prefs, "set">>) => void;
};

export const usePrefs = create<Prefs>()(
  persist(
    (set) => ({
      textScale: 1,
      reduceMotion: false,
      explain: "intuition",
      sessionMinutes: 30,
      formats: ["video", "interactive", "article"],
      challenge: "balanced",
      saved: [],
      done: [],
      hidden: [],
      level: null,
      onboardingSkipped: false,
      personalise: true,
      readerMode: "text",
      proveIt: true,
      set: (p) => set(p),
    }),
    { name: "openresearch-prefs" },
  ),
);

/** Applies display prefs to <html> so CSS can use them. */
export function ReaderPrefsSync() {
  const { textScale, reduceMotion } = usePrefs();
  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty("--reading-scale", String(textScale));
    el.dataset.reduceMotion = String(reduceMotion);
  }, [textScale, reduceMotion]);
  return null;
}

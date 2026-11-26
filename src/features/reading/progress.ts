"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Furthest point read per paper (0..1), kept in the browser. */
export const useReadProgress = create<{ read: Record<string, number>; set: (id: string, v: number) => void }>()(
  persist(
    (set) => ({
      read: {},
      set: (id, v) => set((s) => (v > (s.read[id] ?? 0) + 0.01 ? { read: { ...s.read, [id]: Math.min(1, v) } } : s)),
    }),
    { name: "openresearch-read-progress" },
  ),
);

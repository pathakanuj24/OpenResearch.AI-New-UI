"use client";

import { create } from "zustand";

/** Guide panel state shared by the reading view, trail, ⌘K and the mobile Ask button. */
export const useGuide = create<{
  open: boolean;
  pending: string | null; // question to send when the guide mounts
  setOpen: (o: boolean) => void;
  ask: (q: string) => void;
  take: () => string | null;
}>((set, get) => ({
  open: false,
  pending: null,
  setOpen: (open) => set({ open }),
  ask: (q) => set({ pending: q, open: true }),
  take: () => { const q = get().pending; set({ pending: null }); return q; },
}));

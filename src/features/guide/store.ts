"use client";

import { create } from "zustand";

/** Guide panel state shared by the reading view, trail, ⌘K and the mobile Ask button. */
export const useGuide = create<{
  open: boolean;
  pending: string | null; // question to send when the guide mounts
  /** An answer to bring into view (from a cited passage's margin pin). The nonce re-triggers the same answer. */
  focus: { messageId: string; nonce: number } | null;
  setOpen: (o: boolean) => void;
  ask: (q: string) => void;
  take: () => string | null;
  showAnswer: (messageId: string) => void;
}>((set, get) => ({
  open: false,
  pending: null,
  focus: null,
  setOpen: (open) => set({ open }),
  ask: (q) => set({ pending: q, open: true }),
  take: () => { const q = get().pending; set({ pending: null }); return q; },
  showAnswer: (messageId) => set({ open: true, focus: { messageId, nonce: Date.now() } }),
}));

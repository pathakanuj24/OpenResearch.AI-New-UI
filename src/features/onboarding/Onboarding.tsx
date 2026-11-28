"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { toast } from "sonner";
import { Button, FieldCover } from "@/components/atlas";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { memoryAPI, type Memory } from "@/lib/api/memory";
import { useAuthStore } from "@/lib/auth/authStore";
import { useMemory } from "@/lib/data";
import { FIELD_LABEL, type FieldKey } from "@/lib/fields";
import { usePrefs, type ExplainStyle } from "@/lib/prefs";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";

export const useOnboarding = create<{ open: boolean; setOpen: (o: boolean) => void }>((set) => ({ open: false, setOpen: (open) => set({ open }) }));

const FIELDS: FieldKey[] = ["cs", "ai", "eng", "math", "phys", "bio", "earth", "econ", "psy", "law", "hist"];
const LEVELS: { label: string; depth: NonNullable<Memory["depth"]> }[] = [
  { label: "Undergraduate", depth: "beginner" },
  { label: "Master's student", depth: "intermediate" },
  { label: "PhD student or researcher", depth: "expert" },
  { label: "Working professional", depth: "intermediate" },
  { label: "New to this field entirely", depth: "beginner" },
];
const STYLES: { value: ExplainStyle; label: string }[] = [
  { value: "intuition", label: "Intuition first, then the formal version" },
  { value: "formal", label: "Formal and precise from the start" },
  { value: "minimal", label: "Just enough to keep reading" },
];

/** Three questions on first run: field, level, explanation style. Opens itself until answered or skipped. */
export function Onboarding() {
  const { open, setOpen } = useOnboarding();
  const memory = useMemory();
  const prefs = usePrefs();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [field, setField] = useState<string>("");
  const [other, setOther] = useState("");
  const [level, setLevel] = useState<number | null>(null);
  const [style, setStyle] = useState<ExplainStyle>(prefs.explain);
  const [saving, setSaving] = useState(false);

  // First run: open once the server says this reader hasn't been onboarded (and they didn't skip here).
  useEffect(() => {
    if (memory.data && !memory.data.onboarded && !prefs.onboardingSkipped) setOpen(true);
  }, [memory.data, prefs.onboardingSkipped, setOpen]);

  // Prefill only when the dialog opens (not when the saved profile refreshes underneath it).
  const wasOpen = useRef(false);
  useEffect(() => {
    const opening = open && !wasOpen.current;
    wasOpen.current = open;
    if (!opening) return;
    setStep(0);
    const f = memory.data?.field ?? "";
    const known = FIELDS.map((k) => FIELD_LABEL[k]).includes(f);
    setField(f ? (known ? f : "Other") : ""); setOther(known ? "" : f);
    const li = LEVELS.findIndex((l) => l.label === prefs.level);
    setLevel(li >= 0 ? li : null); setStyle(prefs.explain);
  }, [open, memory.data?.field, prefs.level, prefs.explain]);

  const chosenField = field === "Other" ? other.trim() : field;
  const canNext = step === 0 ? Boolean(chosenField) : step === 1 ? level !== null : true;

  const finish = async () => {
    setSaving(true);
    try {
      const depth = level !== null ? LEVELS[level].depth : undefined;
      const levelLabel = level !== null ? LEVELS[level].label : null;
      await memoryAPI.setPreferences({ field: chosenField, depth, level: levelLabel, explain: style, session_minutes: prefs.sessionMinutes,
        formats: prefs.formats, challenge: prefs.challenge, personalise: prefs.personalise });
      track({ type: "onboarding_completed", meta: { field: chosenField, level: levelLabel, explain: style } });
      prefs.set({ explain: style, level: level !== null ? LEVELS[level].label : null, onboardingSkipped: false });
      // Update the cached profile now so the dialog can't reopen, then refresh in the background.
      qc.setQueryData<Memory>(["memory"], (m) => (m ? { ...m, field: chosenField, depth: depth ?? m.depth, onboarded: true } : m));
      void qc.invalidateQueries({ queryKey: ["memory"] });
      setOpen(false);
      toast(`All set for ${chosenField}${user?.displayName ? `. Welcome, ${user.displayName.split(" ")[0]}!` : "."}`);
    } catch { toast.error("Couldn't save your answers. Try again."); }
    finally { setSaving(false); }
  };
  const skip = () => { prefs.set({ onboardingSkipped: true }); setOpen(false); };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) skip(); }}>
      <DialogContent className="max-w-[640px] rounded-[var(--r-xl)] border-line bg-surface p-7 shadow-2 [&>button]:hidden">
        {step === 0 ? (
          <>
            <p className="text-[12.5px] font-semibold text-ink-3">Welcome to Insightway · 1 of 3</p>
            <DialogTitle className="text-[26px] font-semibold tracking-[-0.03em]">Where do you mostly read?</DialogTitle>
            <DialogDescription className="text-ink-2">Every field gets the same care. You can read anything; this just tunes the first explanations.</DialogDescription>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4" role="radiogroup" aria-label="Field">
              {[...FIELDS.map((k) => FIELD_LABEL[k]), "Other"].map((f, i) => (
                <button key={f} type="button" role="radio" aria-checked={field === f} onClick={() => setField(f)}
                  className={cn("overflow-hidden rounded-[var(--r)] border-2 bg-surface text-left transition-[transform,border-color] duration-[var(--t-med)] ease-spring hover:-translate-y-0.5",
                    field === f ? "border-moss" : "border-line")}>
                  <FieldCover field={f === "Other" ? null : f} seed={`ob-${i}`} label={false} height={54} />
                  <span className="block px-2.5 py-2 text-[13.5px] font-semibold">{f === "Other" ? "Something else" : f}</span>
                </button>
              ))}
            </div>
            {field === "Other" ? (
              <input autoFocus value={other} onChange={(e) => setOther(e.target.value)} placeholder="e.g. Musicology, Public health, Architecture" aria-label="Your field"
                className="mt-3 h-12 w-full rounded-[14px] border-[1.5px] border-line-2 bg-surface px-4 outline-none focus:border-moss focus:shadow-[0_0_0_5px_var(--moss-soft)]" />
            ) : null}
          </>
        ) : step === 1 ? (
          <>
            <p className="text-[12.5px] font-semibold text-ink-3">2 of 3</p>
            <DialogTitle className="text-[26px] font-semibold tracking-[-0.03em]">How far along are you?</DialogTitle>
            <DialogDescription className="text-ink-2">So Iris knows which basics to skip.</DialogDescription>
            <Options items={LEVELS.map((l) => l.label)} value={level === null ? null : LEVELS[level].label} onPick={(_, i) => setLevel(i)} label="Level" />
          </>
        ) : (
          <>
            <p className="text-[12.5px] font-semibold text-ink-3">3 of 3</p>
            <DialogTitle className="text-[26px] font-semibold tracking-[-0.03em]">How do you like things explained?</DialogTitle>
            <DialogDescription className="text-ink-2">Change it any time in My learning.</DialogDescription>
            <Options items={STYLES.map((s) => s.label)} value={STYLES.find((s) => s.value === style)?.label ?? null} onPick={(_, i) => setStyle(STYLES[i].value)} label="Explanation style" />
          </>
        )}
        <div className="mt-6 flex items-center gap-2.5">
          <div className="flex gap-1.5" aria-hidden>{[0, 1, 2].map((i) => <i key={i} className={cn("h-2 rounded-pill transition-all", i === step ? "w-6 bg-moss" : "w-2 bg-line-2")} />)}</div>
          <span className="flex-1" />
          <Button variant="ghost" onClick={() => (step ? setStep(step - 1) : skip())}>{step ? "Back" : "Skip"}</Button>
          <Button variant="pri" disabled={!canNext} loading={saving} onClick={() => (step < 2 ? setStep(step + 1) : void finish())}>
            {step < 2 ? "Continue" : "Start exploring"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Options({ items, value, onPick, label }: { items: string[]; value: string | null; onPick: (v: string, i: number) => void; label: string }) {
  return (
    <div className="mt-4 space-y-2" role="radiogroup" aria-label={label}>
      {items.map((it, i) => (
        <button key={it} type="button" role="radio" aria-checked={value === it} onClick={() => onPick(it, i)}
          className={cn("flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left text-[15px] font-medium transition-colors",
            value === it ? "border-moss bg-moss-soft" : "border-line bg-surface hover:border-line-2")}>
          <span className={cn("grid size-[18px] shrink-0 place-items-center rounded-full border-2", value === it ? "border-moss" : "border-line-2")}>
            {value === it ? <span className="size-2 rounded-full bg-moss" /> : null}
          </span>
          {it}
        </button>
      ))}
    </div>
  );
}

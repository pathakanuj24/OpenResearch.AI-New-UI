"use client";

import { useRouter } from "next/navigation";

import { useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import { Topo } from "@/components/atlas";
import { useAuthStore } from "@/lib/auth/authStore";
import { useMemory, useUpload } from "@/lib/data";
import { useOnboarding } from "@/features/onboarding/Onboarding";
import { cn } from "@/lib/utils";

/** Replaces Today until the first upload. Never shows empty stats. */
export function FirstRun() {
  const user = useAuthStore((s) => s.user);
  const memory = useMemory();
  const upload = useUpload();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const openOnboarding = useOnboarding((s) => s.setOpen);
  const steps = [
    { label: "Create your account", done: true },
    { label: "Tell us your field and depth", done: Boolean(memory.data?.onboarded), action: () => openOnboarding(true) },
    { label: "Upload a paper", done: false },
    { label: "Ask your first question", done: false },
  ];
  return (
    <div className="mx-auto max-w-[1220px] px-4 pt-4 md:px-6">
      <section className="relative overflow-hidden rounded-[28px] border border-line bg-surface p-6 shadow-1 md:p-10">
        <Topo seed="first-run" className="absolute inset-0 size-full text-line-2" opacity={0.5} />
        <div className="relative grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-[13px] font-semibold text-ink-3">Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}</p>
            <h1 className="mt-2 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] md:text-[46px]">Let&apos;s map your first paper.</h1>
            <p className="mt-3 max-w-[46ch] text-[17px] text-ink-2">
              Upload the paper you&apos;re stuck on. In about a minute you&apos;ll have Iris, cited answers and a trail of what to learn first.
            </p>
            <ol className="mt-6 space-y-2">
              {steps.map((s, i) => {
                const body = (
                  <>
                    <span className={cn("grid size-7 place-items-center rounded-lg text-[13px] font-semibold", s.done ? "bg-known-soft text-known" : "bg-surface text-ink-2")}>
                      {s.done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={cn("font-medium", s.done && "text-ink-3 line-through")}>{s.label}</span>
                    {"action" in s && !s.done ? <span className="ml-auto text-sm font-semibold text-moss-text">Answer 3 questions →</span> : null}
                  </>
                );
                return (
                  <li key={s.label}>
                    {"action" in s && s.action && !s.done ? (
                      <button type="button" onClick={s.action} className="flex w-full items-center gap-3 rounded-[14px] bg-surface-2 px-4 py-3 text-left ring-moss transition-shadow hover:ring-2">{body}</button>
                    ) : <div className="flex items-center gap-3 rounded-[14px] bg-surface-2 px-4 py-3">{body}</div>}
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="flex flex-col justify-center">
            <button type="button" onClick={() => input.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) void upload(f).then((id) => { if (id) router.push(`/papers/${id}`); }); }}
              className={cn("flex min-h-[230px] flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed px-6 text-center transition-colors",
                over ? "border-moss bg-moss-soft" : "border-line-2 hover:border-moss hover:bg-moss-soft/40")}>
              <input ref={input} type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f).then((id) => { if (id) router.push(`/papers/${id}`); }); e.target.value = ""; }} />
              <span className="grid size-16 place-items-center rounded-[18px] bg-moss text-moss-ink"><Plus className="size-7" /></span>
              <span className="text-lg font-semibold">Drop a PDF here</span>
              <span className="text-sm text-ink-3">or click to choose a file · any field · text PDFs up to 50 MB</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { BookOpen, MessageCircleQuestion, Moon, Settings, Upload } from "lucide-react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { StateIcon } from "@/components/atlas";
import { useLastPaper, useLibrary, useMemory } from "@/lib/data";
import { APP_NAV } from "./nav";
import { useGuide } from "@/features/guide/store";
import { useOnboarding } from "@/features/onboarding/Onboarding";
import { track } from "@/lib/track";

export function CommandPalette({ open, onOpenChange, onUpload }: {
  open: boolean; onOpenChange: (o: boolean) => void; onUpload: () => void;
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { papers } = useLibrary();
  const memory = useMemory();
  const last = useLastPaper((s) => s.id);
  const ask = useGuide((s) => s.ask);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onOpenChange(!open); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const run = (fn: () => void) => { onOpenChange(false); setQuery(""); fn(); };
  const readyPapers = (papers ?? []).filter((p) => p.status !== "processing");

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search" description="Search papers, concepts, or ask Iris">
      <CommandInput placeholder="Search papers, concepts, or ask…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>Nothing matches. Press Enter on “Ask Iris” to ask instead.</CommandEmpty>
        {query.trim().length > 3 && last ? (
          <CommandGroup heading="Ask">
            <CommandItem value={`ask ${query}`} onSelect={() => run(() => { track({ type: "search", value: query.trim(), meta: { as: "question" } }); ask(query.trim()); router.push(`/papers/${last}?guide=1`); })}>
              <MessageCircleQuestion /> Ask Iris: “{query.trim()}”
            </CommandItem>
          </CommandGroup>
        ) : null}
        {readyPapers.length ? (
          <CommandGroup heading="Papers">
            {readyPapers.map((p) => (
              <CommandItem key={p.id} value={`paper ${p.title} ${p.field ?? ""}`} onSelect={() => run(() => router.push(`/papers/${p.id}`))}>
                <BookOpen /> <span className="truncate">{p.title}</span>
                {p.field ? <span className="ml-auto shrink-0 text-xs text-ink-3">{p.field}</span> : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        {memory.data?.concepts.length ? (
          <CommandGroup heading="Concepts">
            {memory.data.concepts.slice(0, 30).map((c) => (
              <CommandItem key={c.key} value={`concept ${c.name}`} onSelect={() => run(() => router.push("/learning"))}>
                <span className={c.status === "known" ? "text-known" : "text-learning"}><StateIcon state={c.status} /></span> {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        <CommandSeparator />
        <CommandGroup heading="Go to">
          {APP_NAV.filter((n) => n.key !== "reading").map((n) => (
            <CommandItem key={n.key} value={`go ${n.label}`} onSelect={() => run(() => router.push(n.href))}><n.icon /> {n.label}</CommandItem>
          ))}
          <CommandItem value="go settings" onSelect={() => run(() => router.push("/settings"))}><Settings /> Settings</CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem value="upload add paper pdf" onSelect={() => run(onUpload)}><Upload /> Add a paper</CommandItem>
          <CommandItem value="redo onboarding field level preferences" onSelect={() => run(() => useOnboarding.getState().setOpen(true))}>
            <Settings /> Redo onboarding
          </CommandItem>
          <CommandItem value="theme dark light" onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}>
            <Moon /> Switch to {resolvedTheme === "dark" ? "light" : "dark"} theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

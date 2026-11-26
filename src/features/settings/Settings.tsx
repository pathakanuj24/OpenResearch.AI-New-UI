"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword, updateProfile } from "firebase/auth";
import { Check } from "lucide-react";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api/client";
import { deleteAnalysis } from "@/lib/api/analysis";
import { memoryAPI } from "@/lib/api/memory";
import { useAuthStore } from "@/lib/auth/authStore";
import { useLibrary, useMemory } from "@/lib/data";
import { usePrefs, type ExplainStyle } from "@/lib/prefs";
import { Button, Card, Eyebrow, FormError, Segmented, Switch, TextField } from "@/components/atlas";
import { FieldRingAvatar } from "@/components/app/AccountMenu";
import { PasswordMeter, passwordOk } from "@/features/auth/PasswordMeter";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const SECTIONS = [["profile", "Profile"], ["reading", "Reading"], ["privacy", "Privacy and data"], ["account", "Account"]] as const;

export function Settings() {
  const [active, setActive] = useState<string>("profile");
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-30% 0px -60% 0px" });
    SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-20 pt-6 md:px-6">
      <Eyebrow>Settings</Eyebrow>
      <h1 className="mb-8 text-[34px] font-semibold tracking-[-0.035em]">Your account</h1>
      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <nav aria-label="Settings sections" className="-mx-4 flex gap-1 overflow-x-auto px-4 md:sticky md:top-24 md:mx-0 md:flex-col md:self-start md:px-0">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined}
              className={cn("shrink-0 rounded-[12px] px-3 py-2 text-[15px] font-medium transition-colors", active === id ? "bg-surface text-ink shadow-1" : "text-ink-2 hover:text-ink")}>{label}</a>
          ))}
        </nav>
        <div className="space-y-5">
          <Profile />
          <Reading />
          <Privacy />
          <Account />
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, sub, children, className }: { id: string; title: string; sub: string; children: React.ReactNode; className?: string }) {
  return (
    <Card id={id} className={cn("scroll-mt-28 rounded-[var(--r-lg)] p-6", className)}>
      <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="mb-5 text-sm text-ink-3">{sub}</p>
      {children}
    </Card>
  );
}

function Row({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-4 first:border-t-0 first:pt-0">
      <div><p className="font-semibold">{title}</p>{sub ? <p className="text-[13px] text-ink-3">{sub}</p> : null}</div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Profile() {
  const user = useAuthStore((s) => s.user);
  const memory = useMemory();
  const qc = useQueryClient();
  const [name, setName] = useState(user?.displayName ?? "");
  const [field, setField] = useState("");
  const [depth, setDepth] = useState<"beginner" | "intermediate" | "expert">("intermediate");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (memory.data) { setField(memory.data.field ?? ""); setDepth(memory.data.depth ?? "intermediate"); } }, [memory.data]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (auth.currentUser && name.trim() && name.trim() !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
        await api.put("/auth/me", { name: name.trim() }).catch(() => undefined);
      }
      await memoryAPI.setPreferences({ field: field.trim() || undefined, depth });
      qc.invalidateQueries({ queryKey: ["memory"] });
      toast("Profile saved.");
    } catch { toast.error("Couldn't save your profile. Try again."); }
    finally { setSaving(false); }
  };
  return (
    <Section id="profile" title="Profile" sub="Used to tune explanations and the trail.">
      <div className="mb-5 flex items-center gap-4">
        <FieldRingAvatar size={64} />
        <div><p className="text-[17px] font-semibold">{user?.displayName || "Your name"}</p><p className="text-[13px] text-ink-3">The ring shows the fields you read most.</p></div>
      </div>
      <form onSubmit={save}>
        <div className="grid gap-x-4 md:grid-cols-2">
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <div className="mb-4 flex flex-col gap-1.5">
            <span className="flex items-center gap-2 text-sm font-semibold">Email {user?.emailVerified ? <span className="inline-flex items-center gap-1 rounded-pill bg-known-soft px-2 text-xs text-known"><Check className="size-3" /> Verified</span> : null}</span>
            <input value={user?.email ?? ""} readOnly className="h-12 rounded-[14px] border-[1.5px] border-line bg-surface-2 px-4 text-ink-2" aria-label="Email" />
          </div>
          <TextField label="Main field" value={field} onChange={(e) => setField(e.target.value)} placeholder="e.g. Economics" />
          <div className="mb-4 flex flex-col gap-1.5">
            <label htmlFor="level" className="text-sm font-semibold">Where you are</label>
            <select id="level" value={depth} onChange={(e) => setDepth(e.target.value as typeof depth)}
              className="h-12 rounded-[14px] border-[1.5px] border-line-2 bg-surface px-4 text-[15.5px] text-ink outline-none focus:border-moss focus:shadow-[0_0_0_5px_var(--moss-soft)]">
              <option value="beginner">New to the field</option><option value="intermediate">Some background</option><option value="expert">Expert in the field</option>
            </select>
          </div>
        </div>
        <Button type="submit" variant="pri" loading={saving}>Save profile</Button>
      </form>
    </Section>
  );
}

function Reading() {
  const { theme, setTheme } = useTheme();
  const { explain, textScale, reduceMotion, set } = usePrefs();
  const opts: { value: ExplainStyle; label: string }[] = [
    { value: "intuition", label: "Intuition first, then the formal version" }, { value: "formal", label: "Formal and precise from the start" }, { value: "minimal", label: "Just enough to keep reading" },
  ];
  return (
    <Section id="reading" title="Reading" sub="How the guide explains and how pages look.">
      <p className="mb-2 font-semibold">Explanation depth</p>
      <div className="mb-5 space-y-2" role="radiogroup" aria-label="Explanation depth">
        {opts.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={explain === o.value} onClick={() => set({ explain: o.value })}
            className={cn("flex w-full items-center gap-3 rounded-[14px] border px-4 py-3 text-left text-[15px] transition-colors",
              explain === o.value ? "border-moss bg-moss-soft" : "border-line bg-surface hover:border-line-2")}>
            <span className={cn("grid size-[18px] place-items-center rounded-full border-2", explain === o.value ? "border-moss" : "border-line-2")}>
              {explain === o.value ? <span className="size-2 rounded-full bg-moss" /> : null}
            </span>{o.label}
          </button>
        ))}
      </div>
      <Row title="Theme" sub="Follow your system or choose one.">
        <Segmented label="Theme" value={(theme as "light" | "dark" | "system") ?? "system"} onChange={setTheme}
          options={[{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "system", label: "System" }]} />
      </Row>
      <div className="border-t border-line py-4">
        <p className="font-semibold">Reading text size</p>
        <p className="text-[13px] text-ink-3">Applies to papers and answers.</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <p className="reading flex-1 rounded-[14px] bg-surface-2 px-4 py-3">Population hardly responds. Residents of hard-hit places do not move away.</p>
          <input type="range" min={0.9} max={1.2} step={0.05} value={textScale} onChange={(e) => set({ textScale: Number(e.target.value) })}
            aria-label="Reading text size" className="w-40 accent-[var(--moss)]" />
        </div>
      </div>
      <Row title="Reduce motion" sub="Turns off springs, highlighter sweeps and the trail drawing. Your system setting is always respected.">
        <Switch checked={reduceMotion} onChange={(v) => set({ reduceMotion: v })} label="Reduce motion" />
      </Row>
    </Section>
  );
}

function Privacy() {
  const { papers } = useLibrary();
  const memory = useMemory();
  const qc = useQueryClient();
  const usage = useQuery({ queryKey: ["usage"], queryFn: async () => (await api.get<{ tokens_today: number; daily_budget: number }>("/v2/me/usage")).data, retry: false });
  const [confirm, setConfirm] = useState(false);
  const m = memory.data;
  const tiles = [
    [`${papers?.length ?? "–"} papers`, "Your uploads, visible only to you"],
    [`${m?.concepts.length ?? "–"} concepts`, "What you know and are learning"],
    [`${m?.episodes.length ?? "–"} session notes`, "Short summaries the guide keeps"],
    [`${m?.interests.length ?? "–"} interests`, "Used to rank your trail"],
  ];
  const clear = async () => {
    try { await memoryAPI.forgetAll(); qc.invalidateQueries({ queryKey: ["memory"] }); toast("Guide memory cleared. Your papers stay."); }
    catch { toast.error("Couldn't clear memory. Try again."); }
  };
  return (
    <Section id="privacy" title="Privacy and data" sub="What OpenResearch keeps about you, and how to take it back.">
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {tiles.map(([a, b]) => <div key={a} className="rounded-[14px] bg-surface-2 px-4 py-3"><p className="font-semibold">{a}</p><p className="text-[13px] text-ink-2">{b}</p></div>)}
      </div>
      {usage.data ? (
        <Row title="Guide usage today" sub="A daily allowance keeps the service fair for everyone.">
          <span className="text-sm font-semibold tabular-nums">{Math.round((100 * usage.data.tokens_today) / Math.max(1, usage.data.daily_budget))}% used</span>
        </Row>
      ) : null}
      <Row title="Use my reading to personalise recommendations" sub="Sends what you open, read, save and ask so the trail and resources fit you. Off means resources are ranked by relevance only.">
        <PersonaliseSwitch />
      </Row>
      <Row title="Clear guide memory" sub="Removes concept states, interests, session notes and your level. Papers stay.">
        <Button size="sm" onClick={() => setConfirm(true)}>Clear memory</Button>
      </Row>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent className="rounded-[var(--r-xl)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear everything the guide remembers?</AlertDialogTitle>
            <AlertDialogDescription>Your stamps, interests, session notes and level are deleted. Your papers and their trails stay. This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-pill">Keep memory</AlertDialogCancel>
            <AlertDialogAction className="rounded-pill bg-f-psy text-moss-ink hover:bg-f-psy/90" onClick={() => void clear()}>Clear memory</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}

function PersonaliseSwitch() {
  const { personalise, set } = usePrefs();
  return <Switch checked={personalise} onChange={(v) => { set({ personalise: v }); toast(v ? "Personalisation on." : "Personalisation off. We'll stop recording your activity."); }} label="Use my reading to personalise recommendations" />;
}

function Account() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const providers = user?.providerData.map((p) => p.providerId) ?? [];
  const [cur, setCur] = useState(""); const [next, setNext] = useState("");
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const change = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(null);
    if (!passwordOk(next)) { setErr("Use at least 8 characters with upper and lower case and a number."); return; }
    if (!auth.currentUser?.email) return;
    setBusy(true);
    try {
      await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(auth.currentUser.email, cur));
      await updatePassword(auth.currentUser, next);
      setCur(""); setNext(""); toast("Password updated.");
    } catch (x: unknown) {
      const code = (x as { code?: string }).code ?? "";
      setErr(code.includes("wrong-password") || code.includes("invalid-credential") ? "Your current password isn't right. Try again." : "Couldn't update your password. Try again.");
    } finally { setBusy(false); }
  };
  return (
    <Section id="account" title="Account" sub="Sign-in methods and security.">
      {providers.includes("google.com") ? (
        <Row title="Google" sub={`Connected as ${user?.email}`}><span className="text-sm font-semibold text-known">Connected</span></Row>
      ) : null}
      {providers.includes("password") ? (
        <form onSubmit={change} className="border-t border-line py-4 first:border-t-0">
          <p className="mb-3 font-semibold">Change password</p>
          {err ? <FormError>{err}</FormError> : null}
          <div className="max-w-md">
            <TextField label="Current password" type="password" autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} />
            <TextField label="New password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className="mb-2" />
            <PasswordMeter value={next} />
          </div>
          <Button type="submit" variant="pri" size="sm" className="mt-4" loading={busy}>Update password</Button>
        </form>
      ) : null}
      <Row title="Sign out" sub="On this device."><Button size="sm" onClick={async () => { await signOut(auth); router.push("/signed-out"); }}>Sign out</Button></Row>
    </Section>
  );
}

function DeleteAccount() {
  const { papers } = useLibrary();
  const router = useRouter();
  const [open, setOpen] = useState(false); const [typed, setTyped] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState<string | null>(null);
  const run = async () => {
    setBusy(true); setErr(null);
    try {
      for (const p of papers ?? []) if (p.status !== "processing") await deleteAnalysis(p.id).catch(() => undefined);
      await memoryAPI.forgetAll().catch(() => undefined);
      await api.delete("/auth/me");
      await auth.currentUser?.delete();
      router.push("/signed-out?deleted=1");
    } catch (x: unknown) {
      const code = (x as { code?: string }).code ?? "";
      setErr(code.includes("requires-recent-login") ? "For safety, sign out and sign in again, then delete your account." : "Something went wrong. Some data may remain; try again.");
    } finally { setBusy(false); }
  };
  return (
    <Section id="delete" title="Delete account" sub="Permanently deletes your papers, trails, concepts and memory, then your sign-in. This can't be undone."
      className="border-f-psy/50">
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>Delete my account…</Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="rounded-[var(--r-xl)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>We&apos;ll delete all {papers?.length ?? 0} papers (PDFs, analyses and trails), everything the guide remembers, then your account. Type <b>delete</b> to confirm.</AlertDialogDescription>
          </AlertDialogHeader>
          {err ? <FormError>{err}</FormError> : null}
          <TextField label="Type delete" value={typed} onChange={(e) => setTyped(e.target.value)} className="mb-0" />
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-pill">Keep my account</AlertDialogCancel>
            <Button variant="danger" disabled={typed.trim().toLowerCase() !== "delete"} loading={busy} onClick={() => void run()}>Delete everything</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Section>
  );
}

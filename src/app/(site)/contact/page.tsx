"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button, TextField } from "@/components/atlas";
import { PageHero } from "@/components/site/Sections";

const TO = "openresearchai24@gmail.com";

export default function Contact() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [msg, setMsg] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) { setErr("Write a message first."); return; }
    const body = `${msg.trim()}\n\n— ${name.trim() || "Insightway reader"}${email.trim() ? ` (${email.trim()})` : ""}`;
    window.location.href = `mailto:${TO}?subject=${encodeURIComponent("Insightway: message from the website")}&body=${encodeURIComponent(body)}`;
  };
  return (
    <>
      <PageHero eyebrow="Contact" title="Talk to us." lede="Questions, a paper that didn't map well, or an idea for a field we should handle better: we read everything." />
      <section className="mx-auto grid max-w-[1220px] gap-10 px-4 md:grid-cols-[1.2fr_1fr] md:px-6">
        <form onSubmit={send} noValidate className="rounded-[var(--r-lg)] border border-line bg-surface p-6 shadow-1">
          <div className="grid gap-x-4 sm:grid-cols-2">
            <TextField label="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Email" type="email" autoComplete="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-4 flex flex-col gap-1.5">
            <label htmlFor="msg" className="text-sm font-semibold">Message</label>
            <textarea id="msg" rows={6} value={msg} onChange={(e) => { setMsg(e.target.value); setErr(null); }} aria-invalid={!!err || undefined}
              className="rounded-[14px] border-[1.5px] border-line-2 bg-surface px-4 py-3 text-[15.5px] outline-none hover:border-ink-3 focus:border-moss focus:shadow-[0_0_0_5px_var(--moss-soft)]" />
            {err ? <span role="alert" className="text-[13px] font-medium text-f-psy">{err}</span> : null}
          </div>
          <Button type="submit" variant="pri" size="lg"><Mail /> Open in your email app</Button>
          <p className="mt-2 text-center text-[13px] text-ink-3">This opens your email app with the message ready to send.</p>
        </form>
        <div className="space-y-4 text-[15px] text-ink-2">
          <p className="text-[17px] font-semibold text-ink">Email us directly</p>
          <a href={`mailto:${TO}`} className="font-semibold text-moss-text">{TO}</a>
          <p>We usually reply within two working days. For a paper that didn&apos;t map well, tell us its field and where you got the PDF.</p>
        </div>
      </section>
    </>
  );
}

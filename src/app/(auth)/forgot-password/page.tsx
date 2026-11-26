"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { MailCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { Button, FormError, TextField } from "@/components/atlas";
import { AuthSplit, firebaseMessage } from "@/features/auth/AuthSplit";

export default function ForgotPage() {
  const [email, setEmail] = useState(""); const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false); const [resent, setResent] = useState(false);
  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("Enter the email you signed up with."); return; }
    setBusy(true); setError(null);
    try { await sendPasswordResetEmail(auth, email.trim()); if (sent) setResent(true); setSent(true); }
    catch (x: unknown) {
      const code = (x as { code?: string }).code;
      // Don't reveal whether an account exists.
      if (code === "auth/user-not-found") setSent(true); else setError(firebaseMessage(code));
    } finally { setBusy(false); }
  };
  if (sent) {
    return (
      <AuthSplit title="Check your inbox" sub={`If there's an account for ${email.trim()}, a reset link is on its way.`}>
        <div className="flex items-center gap-3 rounded-[var(--r)] bg-moss-soft px-4 py-4 text-moss-text"><MailCheck className="size-6" /> The link expires in an hour. Check spam if you don&apos;t see it.</div>
        <Button size="lg" className="mt-5" loading={busy} onClick={() => void send()}>{resent ? "Sent again" : "Resend the link"}</Button>
        <p className="mt-6 text-center text-[15px]"><Link href="/login" className="font-semibold text-moss-text">Back to log in</Link></p>
      </AuthSplit>
    );
  }
  return (
    <AuthSplit title="Reset your password" sub="We'll email you a link to choose a new one.">
      {error ? <FormError>{error}</FormError> : null}
      <form onSubmit={send} noValidate>
        <TextField label="Email" type="email" autoComplete="email" placeholder="you@university.edu" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} />
        <Button type="submit" variant="pri" size="lg" loading={busy}>Send reset link</Button>
      </form>
      <p className="mt-6 text-center text-[15px] text-ink-2">Remembered it? <Link href="/login" className="font-semibold text-moss-text">Log in</Link></p>
    </AuthSplit>
  );
}

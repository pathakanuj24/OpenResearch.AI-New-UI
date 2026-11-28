"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { browserLocalPersistence, browserSessionPersistence, GoogleAuthProvider, setPersistence, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button, FormError, TextField } from "@/components/atlas";
import { AuthSplit, Divider, firebaseMessage, GoogleIcon } from "@/features/auth/AuthSplit";

export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [show, setShow] = useState(false); const [keep, setKeep] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string | null }>({});
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const emailRef = useRef<HTMLInputElement>(null); const pwRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = "Enter your email, like you@university.edu.";
    if (!password) errs.password = "Enter your password.";
    setErrors(errs);
    if (errs.email) return emailRef.current?.focus();
    if (errs.password) return pwRef.current?.focus();
    setBusy("email");
    try {
      await setPersistence(auth, keep ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (x: unknown) { setErrors({ form: firebaseMessage((x as { code?: string }).code) }); }
    finally { setBusy(null); }
  };
  const google = async () => {
    setBusy("google"); setErrors({});
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (x: unknown) { const m = firebaseMessage((x as { code?: string }).code); if (m) setErrors({ form: m }); }
    finally { setBusy(null); }
  };
  return (
    <AuthSplit title="Welcome back" sub="Pick up your trail where you left it.">
      <Button size="lg" onClick={google} loading={busy === "google"}><GoogleIcon /> Continue with Google</Button>
      <Divider>or with email</Divider>
      {errors.form ? <FormError>{errors.form}</FormError> : null}
      <form onSubmit={submit} noValidate>
        <TextField ref={emailRef} label="Email" type="email" autoComplete="email" placeholder="you@university.edu" value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors((s) => ({ ...s, email: undefined })); }} error={errors.email} />
        <TextField ref={pwRef} label="Password" type={show ? "text" : "password"} autoComplete="current-password" placeholder="Your password" value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((s) => ({ ...s, password: undefined })); }} error={errors.password}
          trailing={<button type="button" onClick={() => setShow(!show)} className="text-[13px] font-semibold text-ink-2">{show ? "Hide" : "Show"}</button>} />
        <div className="mb-5 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-2">
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className="size-5 rounded-md accent-[var(--moss)]" /> Keep me signed in
          </label>
          <Link href="/forgot-password" className="text-sm font-semibold text-moss-text">Forgot password?</Link>
        </div>
        <Button type="submit" variant="pri" size="lg" loading={busy === "email"}>Log in</Button>
      </form>
      <p className="mt-6 text-center text-[15px] text-ink-2">New to Insightway? <Link href="/signup" className="font-semibold text-moss-text">Create an account</Link></p>
    </AuthSplit>
  );
}

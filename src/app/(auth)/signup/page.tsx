"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button, FormError, TextField } from "@/components/atlas";
import { AuthSplit, Divider, firebaseMessage, GoogleIcon } from "@/features/auth/AuthSplit";
import { PasswordMeter, passwordOk } from "@/features/auth/PasswordMeter";

export default function SignupPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string | null }>({});
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), password: useRef<HTMLInputElement>(null) };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Tell us what to call you.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = "Enter your email, like you@university.edu.";
    if (!passwordOk(password)) errs.password = "Use at least 8 characters with upper and lower case and a number.";
    setErrors(errs);
    const first = (["name", "email", "password"] as const).find((k) => errs[k]);
    if (first) return refs[first].current?.focus();
    setBusy("email");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
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
    <AuthSplit title="Start your first trail" sub="Free to start. Works with any text PDF, in any field.">
      <Button size="lg" onClick={google} loading={busy === "google"}><GoogleIcon /> Sign up with Google</Button>
      <Divider>or with email</Divider>
      {errors.form ? <FormError>{errors.form}</FormError> : null}
      <form onSubmit={submit} noValidate>
        <TextField ref={refs.name} label="Name" autoComplete="name" placeholder="Priya Sharma" value={name} error={errors.name}
          onChange={(e) => { setName(e.target.value); setErrors((s) => ({ ...s, name: undefined })); }} />
        <TextField ref={refs.email} label="Email" type="email" autoComplete="email" placeholder="you@university.edu" value={email} error={errors.email}
          help="Your university email works best." onChange={(e) => { setEmail(e.target.value); setErrors((s) => ({ ...s, email: undefined })); }} />
        <TextField ref={refs.password} label="Password" type={show ? "text" : "password"} autoComplete="new-password" value={password} error={errors.password}
          className="mb-2" onChange={(e) => { setPassword(e.target.value); setErrors((s) => ({ ...s, password: undefined })); }}
          trailing={<button type="button" onClick={() => setShow(!show)} className="text-[13px] font-semibold text-ink-2">{show ? "Hide" : "Show"}</button>} />
        <PasswordMeter value={password} />
        <Button type="submit" variant="pri" size="lg" className="mt-6" loading={busy === "email"}>Create account</Button>
      </form>
      <p className="mt-4 text-center text-[13px] text-ink-3">By creating an account you agree to the Terms and Privacy policy.</p>
      <p className="mt-4 text-center text-[15px] text-ink-2">Already have an account? <Link href="/login" className="font-semibold text-moss-text">Log in</Link></p>
    </AuthSplit>
  );
}

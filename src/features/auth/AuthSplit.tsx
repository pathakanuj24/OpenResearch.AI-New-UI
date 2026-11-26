import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo, MiniTrail, Topo } from "@/components/atlas";

/** Split screen: moss panel with contours, one-line serif promise and the mini trail; form on the right. */
export function AuthSplit({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-bg lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-moss p-12 text-moss-ink lg:flex lg:flex-col">
        <Topo seed="auth" className="absolute inset-0 size-full" stroke="var(--moss-ink)" opacity={0.22} rings={8} centers={3} />
        <div className="relative"><Logo tone="sun" light /></div>
        <div className="relative mt-auto max-w-md">
          <p className="font-read text-[40px] leading-[1.15]">Every paper you read makes the next one easier.</p>
          <p className="mt-4 opacity-85">Cited answers, a trail from basics to the frontier, and a memory of what you already know. For every field.</p>
        </div>
        <MiniTrail className="relative mt-10" labels={false}
          stops={[{ state: "done" }, { state: "done" }, { state: "done" }, { state: "done" }, { state: "current" }, { state: "ahead" }, { state: "ahead" }, { state: "ahead" }]} />
      </aside>
      <main className="flex flex-col px-5 py-6 md:px-10">
        <Link href="/" className="inline-flex w-fit items-center gap-1.5 rounded-pill px-2 py-1 font-semibold"><ArrowLeft className="size-4" /> Home</Link>
        <div className="mx-auto my-auto w-full max-w-[420px] py-10">
          <h1 className="text-[34px] font-semibold tracking-[-0.035em]">{title}</h1>
          <p className="mb-7 mt-1 text-ink-2">{sub}</p>
          {children}
        </div>
      </main>
    </div>
  );
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-[18px]" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function Divider({ children }: { children: React.ReactNode }) {
  return <div className="my-5 flex items-center gap-3 text-[13px] text-ink-3"><span className="h-px flex-1 bg-line" />{children}<span className="h-px flex-1 bg-line" /></div>;
}

export function firebaseMessage(code?: string) {
  switch (code) {
    case "auth/invalid-email": return "That email doesn't look right. Check it and try again.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "That email and password don't match. Try again, or reset your password.";
    case "auth/too-many-requests": return "Too many attempts. Wait a minute, then try again.";
    case "auth/email-already-in-use": return "There's already an account with this email. Log in instead.";
    case "auth/weak-password": return "Choose a stronger password: at least 8 characters with a number.";
    case "auth/popup-closed-by-user": return null;
    case "auth/network-request-failed": return "We couldn't reach the server. Check your connection and try again.";
    default: return "Something went wrong. Try again.";
  }
}

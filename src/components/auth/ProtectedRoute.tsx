"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth/authStore";
import { routes } from "@/lib/routes";
import { LogoMark } from "@/components/atlas";

export function FullScreenLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-bg" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-ink-3">
        <LogoMark className="animate-pulse" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  useEffect(() => {
    if (!loading && !user) router.replace(`${routes.login}?next=${encodeURIComponent(pathname)}`);
  }, [user, loading, router, pathname]);
  if (loading || !user) return <FullScreenLoader label={loading ? "Loading…" : "Taking you to sign in…"} />;
  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/auth/authStore";
import { routes } from "@/lib/routes";
import { FullScreenLoader } from "./ProtectedRoute";

/** Sign-in pages: signed-in readers go straight to where they were heading (or Today). */
export default function PublicRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const next = params.get("next");
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : routes.today;
  useEffect(() => {
    if (!loading && user) router.replace(target);
  }, [user, loading, router, target]);
  if (loading) return <FullScreenLoader />;
  return <>{children}</>;
}

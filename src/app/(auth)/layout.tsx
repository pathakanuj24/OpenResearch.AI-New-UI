import { Suspense } from "react";
import PublicRoute from "@/components/auth/PublicRoute";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Suspense><PublicRoute>{children}</PublicRoute></Suspense>;
}

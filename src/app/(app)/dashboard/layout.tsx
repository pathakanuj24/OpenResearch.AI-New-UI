import DashboardShell from "@/components/dashboard/DashboardShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AppDataProvider } from "@/lib/contexts/AppDataContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppDataProvider>
        <DashboardShell>{children}</DashboardShell>
      </AppDataProvider>
    </ProtectedRoute>
  );
}

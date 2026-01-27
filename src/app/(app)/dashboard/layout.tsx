import DashboardShell from "@/components/dashboard/DashboardShell";
import { AppDataProvider } from "@/lib/contexts/AppDataContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
      <DashboardShell>{children}</DashboardShell>
    </AppDataProvider>
  );
}

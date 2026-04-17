import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  return <DashboardShell isAdmin={profile?.role === "admin"}>{children}</DashboardShell>;
}

import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar base="/dashboard" />
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}

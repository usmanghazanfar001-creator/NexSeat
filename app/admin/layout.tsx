import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar base="/admin" />
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}

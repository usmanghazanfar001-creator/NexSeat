"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Layers,
  Wallet,
  Bell,
  Settings,
  Users,
  ShieldCheck,
  LifeBuoy,
  BarChart3,
} from "lucide-react";

const dashboardLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/subscriptions", label: "My subscriptions", icon: Layers },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: Layers },
  { href: "/admin/tickets", label: "Support tickets", icon: LifeBuoy },
  { href: "/admin/settings", label: "Platform settings", icon: ShieldCheck },
];

export function Sidebar({ base }: { base: "/dashboard" | "/admin" }) {
  const pathname = usePathname();
  const links = base === "/admin" ? adminLinks : dashboardLinks;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border/60 bg-card/40 p-4 md:block">
      <Link href="/" className="mb-8 block px-2 font-display text-lg font-bold">
        Nex<span className="text-gradient">Seat</span>
      </Link>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-meter-gradient text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

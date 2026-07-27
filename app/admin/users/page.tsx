"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "OWNER" | "ADMIN";
  verified: boolean;
  wallet: number;
  createdAt: string;
  _count: { subscriptions: number; memberships: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (q?: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/users${q ? `?search=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (user: AdminUser) => {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    load(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load(search)}
          className="h-10 w-64 rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 text-left text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Wallet</th>
                <th className="p-4 font-medium">Groups</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && users.map((u) => (
                <tr key={u.id} className="border-b border-border/40 last:border-0">
                  <td className="p-4">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="p-4"><Badge>{u.role}</Badge></td>
                  <td className="p-4">{formatCurrency(u.wallet)}</td>
                  <td className="p-4">{u._count.subscriptions} hosted · {u._count.memberships} joined</td>
                  <td className="p-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="p-4">
                    <Button size="sm" variant="outline" onClick={() => toggleAdmin(u)}>
                      {u.role === "ADMIN" ? "Revoke admin" : "Make admin"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="p-6 text-sm text-muted-foreground">Loading users...</p>}
          {!loading && users.length === 0 && <p className="p-6 text-sm text-muted-foreground">No users found.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

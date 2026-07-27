"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

type AdminSubscription = {
  id: string;
  platform: string;
  monthlyPrice: number;
  availableSlots: number;
  occupiedSlots: number;
  status: "ACTIVE" | "FULL" | "PAUSED" | "CANCELLED";
  renewalDate: string;
  owner: { name: string; email: string };
  _count: { members: number };
};

export default function AdminSubscriptionsPage() {
  const [items, setItems] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/subscriptions");
    const data = await res.json();
    setItems(data.subscriptions ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id: string, status: AdminSubscription["status"]) => {
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Subscriptions</h1>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 text-left text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Platform</th>
                <th className="p-4 font-medium">Host</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Seats</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Renews</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.map((s) => (
                <tr key={s.id} className="border-b border-border/40 last:border-0">
                  <td className="p-4 font-medium">{s.platform}</td>
                  <td className="p-4">
                    <p>{s.owner.name}</p>
                    <p className="text-xs text-muted-foreground">{s.owner.email}</p>
                  </td>
                  <td className="p-4">{formatCurrency(s.monthlyPrice)}/mo</td>
                  <td className="p-4">{s.occupiedSlots}/{s.availableSlots}</td>
                  <td className="p-4"><Badge>{s.status}</Badge></td>
                  <td className="p-4 text-muted-foreground">{formatDate(s.renewalDate)}</td>
                  <td className="p-4 space-x-2">
                    {s.status !== "PAUSED" ? (
                      <Button size="sm" variant="outline" onClick={() => setStatus(s.id, "PAUSED")}>Pause</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setStatus(s.id, "ACTIVE")}>Resume</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => setStatus(s.id, "CANCELLED")}>Cancel</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="p-6 text-sm text-muted-foreground">Loading...</p>}
        </CardContent>
      </Card>
    </div>
  );
}

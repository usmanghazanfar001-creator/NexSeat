"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

type AdminSubscription = {
  id: string;
  platform: string;
  category: string | null;
  description: string | null;
  websiteUrl: string | null;
  monthlyPrice: number;
  yearlyPrice: number | null;
  availableSlots: number;
  occupiedSlots: number;
  status: "ACTIVE" | "FULL" | "PAUSED" | "CANCELLED";
  isPopular: boolean;
  isFeatured: boolean;
  isEnabled: boolean;
  rating: number | null;
  renewalDate: string;
  owner: { name: string; email: string };
  _count: { members: number };
};

const emptyForm = {
  platform: "",
  category: "AI Assistants",
  description: "",
  websiteUrl: "",
  monthlyPrice: 10,
  yearlyPrice: "",
  availableSlots: 5,
  rating: 4.5,
  isPopular: false,
  isFeatured: false,
  supportEmail: "",
};

export default function AdminSubscriptionsPage() {
  const [items, setItems] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[],
    [items]
  );

  const filtered = items.filter((i) => {
    const matchesSearch = i.platform.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || i.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const setStatus = async (id: string, status: AdminSubscription["status"]) => {
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const toggleField = async (id: string, field: "isPopular" | "isFeatured" | "isEnabled", value: boolean) => {
    await fetch(`/api/admin/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    load();
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (item: AdminSubscription) => {
    setEditingId(item.id);
    setForm({
      platform: item.platform,
      category: item.category ?? "AI Assistants",
      description: item.description ?? "",
      websiteUrl: item.websiteUrl ?? "",
      monthlyPrice: Number(item.monthlyPrice),
      yearlyPrice: item.yearlyPrice ? String(item.yearlyPrice) : "",
      availableSlots: item.availableSlots,
      rating: item.rating ? Number(item.rating) : 4.5,
      isPopular: item.isPopular,
      isFeatured: item.isFeatured,
      supportEmail: "",
    });
    setFormOpen(true);
  };

  const duplicate = async (item: AdminSubscription) => {
    setSaving(true);
    await fetch("/api/admin/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: `${item.platform} (Copy)`,
        category: item.category ?? "AI Assistants",
        monthlyPrice: Number(item.monthlyPrice),
        availableSlots: item.availableSlots,
        duplicateFromId: item.id,
      }),
    });
    setSaving(false);
    load();
  };

  const saveForm = async () => {
    setSaving(true);
    const payload = {
      platform: form.platform,
      category: form.category,
      description: form.description,
      websiteUrl: form.websiteUrl || undefined,
      monthlyPrice: Number(form.monthlyPrice),
      yearlyPrice: form.yearlyPrice ? Number(form.yearlyPrice) : undefined,
      availableSlots: Number(form.availableSlots),
      rating: Number(form.rating),
      isPopular: form.isPopular,
      isFeatured: form.isFeatured,
      supportEmail: form.supportEmail || undefined,
    };

    if (editingId) {
      await fetch(`/api/admin/subscriptions/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setFormOpen(false);
    load();
  };

  const exportCsv = () => {
    const header = ["Platform", "Category", "Host", "Monthly Price", "Seats", "Occupied", "Status", "Rating"];
    const rows = filtered.map((i) => [
      i.platform,
      i.category ?? "",
      i.owner.email,
      String(i.monthlyPrice),
      String(i.availableSlots),
      String(i.occupiedSlots),
      i.status,
      i.rating ? String(i.rating) : "",
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nexseat-subscriptions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Subscriptions ({items.length})</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
          <Button size="sm" onClick={openAdd}>+ Add subscription</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-56 rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="FULL">Full</option>
          <option value="PAUSED">Paused</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {formOpen && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-display text-lg font-semibold">{editingId ? "Edit subscription" : "Add new subscription"}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Platform name</label>
                <input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Category</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Monthly price ($)</label>
                <input type="number" value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: Number(e.target.value) })}
                  className="h-10 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>

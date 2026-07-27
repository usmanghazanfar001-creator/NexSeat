import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlotGauge } from "@/components/home/slot-gauge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, Layers, Bell, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [user, owned, joined, unreadCount] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.subscription.findMany({ where: { ownerId: userId }, include: { _count: { select: { members: true } } } }),
    prisma.member.findMany({
      where: { userId, active: true },
      include: { subscription: true },
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  const stats = [
    { label: "Wallet balance", value: formatCurrency(Number(user.wallet)), icon: Wallet },
    { label: "Hosted groups", value: owned.length, icon: Layers },
    { label: "Joined groups", value: joined.length, icon: TrendingUp },
    { label: "Unread notifications", value: unreadCount, icon: Bell },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Here's what's happening with your subscriptions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-xl font-bold">{s.value}</p>
              </div>
              <s.icon className="h-8 w-8 text-primary/60" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Groups you host</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {owned.length === 0 && <p className="text-sm text-muted-foreground">You don't host any groups yet.</p>}
            {owned.map((s) => (
              <div key={s.id} className="rounded-xl border border-border/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium">{s.platform}</p>
                  <p className="text-xs text-muted-foreground">Renews {formatDate(s.renewalDate)}</p>
                </div>
                <SlotGauge total={s.availableSlots} occupied={s.occupiedSlots} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Groups you've joined</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {joined.length === 0 && <p className="text-sm text-muted-foreground">You haven't joined any groups yet.</p>}
            {joined.map((m) => (
              <div key={m.id} className="rounded-xl border border-border/60 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-medium">{m.subscription.platform}</p>
                  <p className="text-xs text-muted-foreground">Renews {formatDate(m.subscription.renewalDate)}</p>
                </div>
                <SlotGauge total={m.subscription.availableSlots} occupied={m.subscription.occupiedSlots} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

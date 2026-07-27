import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export default async function AdminOverviewPage() {
  const [userCount, activeSubscriptions, totalRevenueAgg, openTickets] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } }),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
  ]);

  const revenueByDay = await prisma.$queryRaw<{ day: string; total: number }[]>`
    SELECT to_char("createdAt", 'YYYY-MM-DD') as day, SUM(amount)::float as total
    FROM "Payment"
    WHERE status = 'SUCCESS' AND "createdAt" > NOW() - INTERVAL '30 days'
    GROUP BY day ORDER BY day ASC;
  `;

  const stats = [
    { label: "Total users", value: userCount },
    { label: "Active groups", value: activeSubscriptions },
    { label: "Total revenue", value: formatCurrency(Number(totalRevenueAgg._sum.amount ?? 0)) },
    { label: "Open tickets", value: openTickets },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Admin overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue — last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueByDay} />
        </CardContent>
      </Card>
    </div>
  );
}

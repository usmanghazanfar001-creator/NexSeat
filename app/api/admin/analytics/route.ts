import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [userCount, activeSubscriptions, totalRevenue, openTickets] = await Promise.all([
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

  return NextResponse.json({
    userCount,
    activeSubscriptions,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    openTickets,
    revenueByDay,
  });
}

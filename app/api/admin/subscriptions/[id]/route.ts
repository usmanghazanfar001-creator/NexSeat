import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "FULL", "PAUSED", "CANCELLED"]),
});

// Admins can pause/cancel a listing, e.g. after a ToS complaint from a provider.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const subscription = await prisma.subscription.update({ where: { id }, data: parsed.data });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ADMIN_UPDATED_SUBSCRIPTION",
      metadata: { subscriptionId: id, status: parsed.data.status },
    },
  });

  return NextResponse.json({ subscription });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.subscription.delete({ where: { id } });
  return NextResponse.json({ message: "Subscription removed" });
}

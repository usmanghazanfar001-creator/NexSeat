import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const membership = await tx.member.findUnique({
        where: { subscriptionId_userId: { subscriptionId: id, userId: session.user.id } },
      });
      if (!membership || !membership.active) {
        throw new Error("You're not a member of this group");
      }

      await tx.member.update({ where: { id: membership.id }, data: { active: false } });

      const subscription = await tx.subscription.update({
        where: { id },
        data: { occupiedSlots: { decrement: 1 }, status: "ACTIVE" },
      });

      await tx.notification.create({
        data: {
          userId: subscription.ownerId,
          title: "Member left",
          message: `Someone left your ${subscription.platform} group. A slot opened up.`,
        },
      });
    });

    return NextResponse.json({ message: "Left the group" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to leave this group";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

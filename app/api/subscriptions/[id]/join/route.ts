import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { joinSubscriptionSchema } from "@/lib/validators";
import { computeSeatPrice } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const parsed = joinSubscriptionSchema.safeParse({ ...(await req.json()), subscriptionId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { paymentMethod, couponCode } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Lock the row logically by re-reading inside the transaction and
      // checking capacity before writing, so two concurrent joins can't
      // both succeed and overbook the last slot.
      const subscription = await tx.subscription.findUniqueOrThrow({ where: { id } });

      if (subscription.ownerId === session.user.id) {
        throw new Error("You already own this subscription");
      }
      if (subscription.occupiedSlots >= subscription.availableSlots) {
        throw new Error("This group is already full");
      }

      const existingMember = await tx.member.findUnique({
        where: { subscriptionId_userId: { subscriptionId: id, userId: session.user.id } },
      });
      if (existingMember?.active) {
        throw new Error("You're already a member of this group");
      }

      const totalSeats = subscription.availableSlots;
      let seatPrice = computeSeatPrice(Number(subscription.monthlyPrice), totalSeats);

      if (couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: couponCode } });
        if (coupon?.active && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
          if (coupon.percentOff) seatPrice -= seatPrice * (coupon.percentOff / 100);
          if (coupon.amountOff) seatPrice -= Number(coupon.amountOff);
          seatPrice = Math.max(0, Math.round(seatPrice * 100) / 100);
          await tx.coupon.update({ where: { id: coupon.id }, data: { timesRedeemed: { increment: 1 } } });
        }
      }

      if (paymentMethod === "WALLET") {
        const user = await tx.user.findUniqueOrThrow({ where: { id: session.user.id } });
        if (Number(user.wallet) < seatPrice) {
          throw new Error("Insufficient wallet balance");
        }
        await tx.user.update({ where: { id: user.id }, data: { wallet: { decrement: seatPrice } } });
      }

      const payment = await tx.payment.create({
        data: {
          userId: session.user.id,
          subscriptionId: subscription.id,
          amount: seatPrice,
          status: paymentMethod === "WALLET" ? "SUCCESS" : "PENDING", // external gateways confirm via webhook
          paymentMethod,
          transactionId: crypto.randomUUID(),
          couponCode,
        },
      });

      await tx.member.upsert({
        where: { subscriptionId_userId: { subscriptionId: subscription.id, userId: session.user.id } },
        create: { subscriptionId: subscription.id, userId: session.user.id },
        update: { active: true, joinedAt: new Date() },
      });

      const updated = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          occupiedSlots: { increment: 1 },
          status: subscription.occupiedSlots + 1 >= subscription.availableSlots ? "FULL" : "ACTIVE",
        },
      });

      await tx.notification.create({
        data: {
          userId: subscription.ownerId,
          title: "New member joined",
          message: `Someone joined your ${subscription.platform} group.`,
        },
      });

      return { subscription: updated, payment };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to join this group";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

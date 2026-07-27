import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(rawBody)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const transactionId = event.payload?.payment?.entity?.notes?.transactionId;
    if (transactionId) {
      const payment = await prisma.payment
        .update({ where: { transactionId }, data: { status: "SUCCESS" } })
        .catch(() => null);

      if (payment && !payment.subscriptionId) {
        await prisma.user.update({
          where: { id: payment.userId },
          data: { wallet: { increment: payment.amount } },
        });
      }
    }
  }

  if (event.event === "payment.failed") {
    const transactionId = event.payload?.payment?.entity?.notes?.transactionId;
    if (transactionId) {
      await prisma.payment.update({ where: { transactionId }, data: { status: "FAILED" } }).catch(() => null);
    }
  }

  return NextResponse.json({ received: true });
}

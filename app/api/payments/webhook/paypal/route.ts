import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PayPal webhook.
 *
 * PayPal's verification flow differs from Stripe's: instead of a simple
 * HMAC signature, you POST the event + a set of headers to PayPal's
 * `/v1/notifications/verify-webhook-signature` endpoint and check that it
 * returns "SUCCESS". That call is stubbed here as `verifyPaypalSignature` -
 * plug in real credentials (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET) before
 * going live, since right now this route trusts the payload.
 */
async function verifyPaypalSignature(_req: NextRequest, _rawBody: string): Promise<boolean> {
  // TODO: call PayPal's verify-webhook-signature API here.
  return true;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const verified = await verifyPaypalSignature(req, rawBody);
  if (!verified) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const transactionId = event.resource?.custom_id;
    if (transactionId) {
      const payment = await prisma.payment.update({
        where: { transactionId },
        data: { status: "SUCCESS" },
      }).catch(() => null);

      if (payment && !payment.subscriptionId) {
        await prisma.user.update({
          where: { id: payment.userId },
          data: { wallet: { increment: payment.amount } },
        });
      }
    }
  }

  if (event.event_type === "PAYMENT.CAPTURE.DENIED") {
    const transactionId = event.resource?.custom_id;
    if (transactionId) {
      await prisma.payment.update({ where: { transactionId }, data: { status: "FAILED" } }).catch(() => null);
    }
  }

  return NextResponse.json({ received: true });
}

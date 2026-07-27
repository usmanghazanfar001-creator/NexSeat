import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendDiscordAlert } from "@/lib/discord";

/**
 * Stripe webhook.
 *
 * IMPORTANT: this route must receive the *raw* request body for signature
 * verification, so it deliberately reads req.text() rather than req.json().
 * Configure this URL (https://yourdomain.com/api/payments/webhook/stripe)
 * in the Stripe dashboard, and copy the signing secret into
 * STRIPE_WEBHOOK_SECRET.
 *
 * The Stripe client is created lazily inside the handler (not at module
 * scope) so the build doesn't crash when STRIPE_SECRET_KEY isn't set yet.
 */
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err) {
    console.error("[STRIPE_WEBHOOK_SIGNATURE_ERROR]", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent | Stripe.Checkout.Session;
      const transactionId = intent.metadata?.transactionId;
      if (transactionId) {
        const payment = await prisma.payment.update({
          where: { transactionId },
          data: { status: "SUCCESS" },
        });

        // Top-ups (no subscriptionId) credit the wallet directly.
        if (!payment.subscriptionId) {
          await prisma.user.update({
            where: { id: payment.userId },
            data: { wallet: { increment: payment.amount } },
          });
        }
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const transactionId = intent.metadata?.transactionId;
      if (transactionId) {
        await prisma.payment.update({ where: { transactionId }, data: { status: "FAILED" } });
      }
      await sendDiscordAlert(`⚠️ Stripe payment failed: ${intent.id}`);
      break;
    }
    default:
      break; // Unhandled event types are ignored, not errors.
  }

  return NextResponse.json({ received: true });
}

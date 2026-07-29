import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import Stripe from "stripe";
import { buildJazzCashRequest } from "@/lib/jazzcash";
import { createRazorpayOrder } from "@/lib/razorpay";

const topUpSchema = z.object({
  amount: z.number().positive().max(5000),
  paymentMethod: z.enum(["STRIPE", "PAYPAL", "RAZORPAY", "JAZZCASH"]),
  // Only relevant when paymentMethod is JAZZCASH — lets the user choose
  // between JazzCash's mobile wallet flow and their debit/credit card flow.
  jazzCashChannel: z.enum(["wallet", "card"]).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { wallet: true },
  });
  return NextResponse.json({ balance: user?.wallet ?? 0 });
}

// In production this route creates a Stripe/PayPal/Razorpay checkout session
// and credits the wallet from the payment gateway's webhook (see
// app/api/payments/webhook/route.ts) rather than trusting the client directly.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = topUpSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { amount, paymentMethod, jazzCashChannel } = parsed.data;

  const payment = await prisma.payment.create({
    data: {
      userId: session.user.id,
      amount,
      status: "PENDING",
      paymentMethod,
      transactionId: crypto.randomUUID(),
    },
  });

  // JazzCash needs a fully-formed, signed field set posted to its hosted
  // checkout page (see lib/jazzcash.ts) rather than a simple redirect URL
  // like the other gateways. The client submits `fields` as a POST form to
  // `checkoutUrl` (an auto-submitting form, not a GET navigation).
  if (paymentMethod === "JAZZCASH") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const { checkoutUrl, fields } = buildJazzCashRequest({
      amount,
      billReference: payment.id,
      description: "NexSeat wallet top-up",
      transactionId: payment.transactionId,
      returnUrl: `${appUrl}/api/payments/webhook/jazzcash`,
      channel: jazzCashChannel ?? "wallet",
    });
    return NextResponse.json({ paymentId: payment.id, checkoutUrl, fields, method: "POST" });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (paymentMethod === "STRIPE") {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "NexSeat wallet top-up" },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      // Read by the webhook to look up this Payment row.
      metadata: { transactionId: payment.transactionId },
      payment_intent_data: { metadata: { transactionId: payment.transactionId } },
      success_url: `${appUrl}/dashboard/wallet?status=success`,
      cancel_url: `${appUrl}/dashboard/wallet?status=cancelled`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Failed to create Stripe checkout session" }, { status: 502 });
    }

    return NextResponse.json({ paymentId: payment.id, checkoutUrl: checkoutSession.url, method: "GET" });
  }

  if (paymentMethod === "RAZORPAY") {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay is not configured" }, { status: 501 });
    }
    // Razorpay has no hosted redirect URL for a plain order the way Stripe
    // does — the client opens Razorpay's Checkout.js widget with the
    // returned order id. See lib/razorpay.ts and docs/PAYMENT_FLOW.md.
    const order = await createRazorpayOrder({
      amountInPaise: Math.round(amount * 100),
      transactionId: payment.transactionId,
      receipt: payment.id,
    });

    return NextResponse.json({
      paymentId: payment.id,
      method: "RAZORPAY_CHECKOUT_JS",
      razorpayOrderId: order.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
    });
  }

  if (paymentMethod === "PAYPAL") {
    // Not yet wired to PayPal's real Orders API — see docs/PAYMENT_FLOW.md.
    return NextResponse.json({ error: "PayPal top-ups are not yet available" }, { status: 501 });
  }

  return NextResponse.json({ error: "Unsupported payment method" }, { status: 400 });
}

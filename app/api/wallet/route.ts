import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { buildJazzCashRequest } from "@/lib/jazzcash";

const topUpSchema = z.object({
  amount: z.number().positive().max(5000),
  paymentMethod: z.enum(["STRIPE", "PAYPAL", "RAZORPAY", "JAZZCASH"]),
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

  const { amount, paymentMethod } = parsed.data;

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
    });
    return NextResponse.json({ paymentId: payment.id, checkoutUrl, fields, method: "POST" });
  }

  // Placeholder for the other gateways: return a redirect URL your client
  // would send the user to. Swap this for a real Stripe Checkout Session /
  // PayPal order / Razorpay order (see docs/PAYMENT_FLOW.md).
  return NextResponse.json({
    paymentId: payment.id,
    checkoutUrl: `/checkout/${payment.id}`,
    method: "GET",
  });
}

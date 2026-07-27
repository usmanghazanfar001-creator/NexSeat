import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySecureHash } from "@/lib/jazzcash";

/**
 * JazzCash posts the transaction result to this URL (set as pp_ReturnURL)
 * after the customer completes or cancels checkout — this is JazzCash's
 * equivalent of Stripe/Razorpay's webhook, but synchronous (the customer's
 * browser is redirected through it) rather than a server-to-server call.
 *
 * pp_ResponseCode "000" = success. Every other code is a decline/failure —
 * see JazzCash's Merchant Integration Guide for the full code list.
 */
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const fields: Record<string, string> = {};
  formData.forEach((value, key) => {
    fields[key] = String(value);
  });

  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT ?? "";
  const verified = verifySecureHash(fields, integritySalt);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!verified) {
    console.error("[JAZZCASH_HASH_MISMATCH]", fields.pp_TxnRefNo);
    return NextResponse.redirect(new URL("/dashboard/wallet?status=failed", appUrl));
  }

  const transactionId = fields.pp_TxnRefNo;
  const success = fields.pp_ResponseCode === "000";

  const payment = await prisma.payment
    .update({
      where: { transactionId },
      data: { status: success ? "SUCCESS" : "FAILED" },
    })
    .catch(() => null);

  if (payment && success && !payment.subscriptionId) {
    await prisma.user.update({
      where: { id: payment.userId },
      data: { wallet: { increment: payment.amount } },
    });
  }

  return NextResponse.redirect(
    new URL(`/dashboard/wallet?status=${success ? "success" : "failed"}`, appUrl)
  );
}

// Some JazzCash flows (e.g. inquiry) may hit this via GET with query params
// instead of a POSTed form — handle both shapes.
export async function GET(req: NextRequest) {
  const fields: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    fields[key] = value;
  });

  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT ?? "";
  const verified = verifySecureHash(fields, integritySalt);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!verified || !fields.pp_TxnRefNo) {
    return NextResponse.redirect(new URL("/dashboard/wallet?status=failed", appUrl));
  }

  const success = fields.pp_ResponseCode === "000";
  const payment = await prisma.payment
    .update({ where: { transactionId: fields.pp_TxnRefNo }, data: { status: success ? "SUCCESS" : "FAILED" } })
    .catch(() => null);

  if (payment && success && !payment.subscriptionId) {
    await prisma.user.update({ where: { id: payment.userId }, data: { wallet: { increment: payment.amount } } });
  }

  return NextResponse.redirect(new URL(`/dashboard/wallet?status=${success ? "success" : "failed"}`, appUrl));
}

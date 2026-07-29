/**
 * Razorpay Order creation (India).
 *
 * Razorpay's flow differs from Stripe's: there's no hosted redirect URL for
 * a plain order. Instead:
 *   1. The server creates an Order via Razorpay's REST API (this file).
 *   2. The client opens Razorpay's Checkout.js widget with the returned
 *      order id, key id, amount, and currency.
 *   3. Razorpay calls our webhook (app/api/payments/webhook/razorpay/route.ts)
 *      with an HMAC-SHA256 signed payload once the payment is captured.
 *
 * Docs: https://razorpay.com/docs/api/orders/
 *
 * No SDK dependency is used here — Razorpay's REST API is simple enough
 * that a single authenticated fetch covers order creation, keeping this in
 * the same "no extra dependency" style as lib/jazzcash.ts.
 */

export class RazorpayError extends Error {}

export async function createRazorpayOrder({
  amountInPaise,
  transactionId,
  receipt,
}: {
  amountInPaise: number;
  transactionId: string;
  receipt: string;
}) {
  const keyId = process.env.RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      // Read by the webhook (payload.payment.entity.notes.transactionId)
      // to look up the matching Payment row.
      notes: { transactionId },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new RazorpayError(`Razorpay order creation failed (${res.status}): ${body}`);
  }

  return (await res.json()) as { id: string; amount: number; currency: string };
}

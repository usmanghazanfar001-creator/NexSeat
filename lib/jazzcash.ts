import crypto from "crypto";

/**
 * JazzCash Merchant Integration (Pakistan).
 *
 * Unlike Stripe/PayPal/Razorpay, JazzCash doesn't use a bearer-token REST
 * API + async webhook. Instead:
 *   1. The merchant builds a signed form (HMAC-SHA256 "Secure Hash" over a
 *      fixed, alphabetically-ordered set of pp_* fields) and POSTs/redirects
 *      the customer to JazzCash's hosted checkout (Mobile Account, Wallet,
 *      or Card).
 *   2. JazzCash redirects the customer back to `pp_ReturnURL` with the
 *      result (also secure-hashed) — that's the "webhook" equivalent here.
 *
 * JazzCash supports two customer-facing channels from the same API:
 *   - pp_TxnType "MWALLET" — JazzCash Mobile Wallet (phone number + PIN)
 *   - pp_TxnType "MPAY"    — Debit/Credit Card (Visa/Mastercard), hosted
 *                             card entry page
 *
 * Docs: https://developer.jazzcash.com.pk (Merchant Integration Guide -
 * Hosted Checkout Page / HTTP POST API). Sandbox and production have
 * different base URLs and credentials — swap JAZZCASH_ENV accordingly.
 */

const SANDBOX_URL = "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
const PRODUCTION_URL = "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

export function getJazzCashCheckoutUrl() {
  return process.env.JAZZCASH_ENV === "production" ? PRODUCTION_URL : SANDBOX_URL;
}

export type JazzCashChannel = "wallet" | "card";

type JazzCashFields = Record<string, string>;

/**
 * Builds the secure hash JazzCash requires: HMAC-SHA256, keyed with the
 * Integrity Salt, over "&"-joined field VALUES sorted by field NAME
 * (excluding pp_SecureHash itself), prefixed with the salt.
 */
export function generateSecureHash(fields: JazzCashFields, integritySalt: string) {
  const sortedKeys = Object.keys(fields)
    .filter((k) => k !== "pp_SecureHash" && fields[k] !== "" && fields[k] != null)
    .sort();

  const hashString = [integritySalt, ...sortedKeys.map((k) => fields[k])].join("&");

  return crypto.createHmac("sha256", integritySalt).update(hashString).digest("hex").toUpperCase();
}

export function verifySecureHash(fields: JazzCashFields, integritySalt: string) {
  const received = fields.pp_SecureHash;
  const expected = generateSecureHash(fields, integritySalt);
  return received === expected;
}

/**
 * Builds the full signed field set for a JazzCash hosted checkout
 * transaction. Pass `channel: "card"` to route the customer to JazzCash's
 * debit/credit card entry page instead of the mobile wallet flow.
 */
export function buildJazzCashRequest({
  amount,
  billReference,
  description,
  transactionId,
  returnUrl,
  channel = "wallet",
}: {
  amount: number; // in PKR
  billReference: string;
  description: string;
  transactionId: string;
  returnUrl: string;
  channel?: JazzCashChannel;
}) {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID ?? "";
  const password = process.env.JAZZCASH_PASSWORD ?? "";
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT ?? "";

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const txnDateTime = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const expiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour expiry
  const txnExpiryDateTime = `${expiry.getFullYear()}${pad(expiry.getMonth() + 1)}${pad(expiry.getDate())}${pad(expiry.getHours())}${pad(expiry.getMinutes())}${pad(expiry.getSeconds())}`;

  // JazzCash expects amount in paisa (amount * 100), as a zero-padded integer string.
  const pp_Amount = String(Math.round(amount * 100));

  const fields: JazzCashFields = {
    pp_Version: "1.1",
    pp_TxnType: channel === "card" ? "MPAY" : "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: transactionId,
    pp_Amount,
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: txnDateTime,
    pp_BillReference: billReference,
    pp_Description: description,
    pp_TxnExpiryDateTime: txnExpiryDateTime,
    pp_ReturnURL: returnUrl,
    pp_SecureHash: "",
  };

  fields.pp_SecureHash = generateSecureHash(fields, integritySalt);

  return { checkoutUrl: getJazzCashCheckoutUrl(), fields };
}

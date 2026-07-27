# Payment flow

## Two ways money moves: wallet top-ups and seat payments

### 1. Wallet top-up
1. Client calls `POST /api/wallet` with `{ amount, paymentMethod }`.
2. The route creates a `Payment` row with `status: "PENDING"` and a unique `transactionId`, then returns checkout instructions.
   - **Stripe / PayPal / Razorpay**: currently a placeholder `checkoutUrl`. Replace it with a real call to:
     - Stripe: `stripe.checkout.sessions.create({ ..., metadata: { transactionId } })`, redirect to `session.url`
     - PayPal: create an order via the Orders v2 API, set `custom_id: transactionId`, redirect to the approval link
     - Razorpay: create an order, pass `notes: { transactionId }`, open Razorpay Checkout client-side
   - **JazzCash**: fully implemented. `lib/jazzcash.ts` builds a signed field set (`pp_*` fields + HMAC-SHA256 `pp_SecureHash`, keyed with `JAZZCASH_INTEGRITY_SALT`) for JazzCash's hosted checkout (Mobile Wallet). Unlike the others, the client can't just redirect — it must POST the signed fields as a form to JazzCash's checkout URL, which is why `POST /api/wallet` returns `{ checkoutUrl, fields, method: "POST" }` for this gateway and the wallet page builds + submits a hidden form (see `app/dashboard/wallet/page.tsx`).
3. The relevant confirmation handler flips `Payment.status` to `"SUCCESS"` and — since a top-up has no `subscriptionId` — credits `User.wallet`:
   - Stripe/PayPal/Razorpay: async server-to-server **webhooks** at `/api/payments/webhook/{stripe,paypal,razorpay}`.
   - JazzCash: no async webhook. Instead, JazzCash redirects the customer's browser back to `pp_ReturnURL` (`/api/payments/webhook/jazzcash`) with the result, secure-hashed the same way. That handler verifies the hash, checks `pp_ResponseCode === "000"` for success, updates the payment, and redirects the user to `/dashboard/wallet?status=success|failed`.

### 2. Joining a group (seat payment)
`POST /api/subscriptions/:id/join` runs inside a single Prisma `$transaction` so two people can't both claim the last open seat:
1. Re-reads the subscription row and checks `occupiedSlots < availableSlots` *inside* the transaction.
2. Computes the per-seat price (`computeSeatPrice` in `lib/utils.ts`) and applies any coupon.
3. If `paymentMethod === "WALLET"`, debits the user's wallet immediately (fails the whole transaction if the balance is insufficient) and marks the payment `SUCCESS` right away.
4. For `STRIPE` / `PAYPAL` / `RAZORPAY`, the payment is created as `PENDING` — in a full build you'd create the gateway checkout session as part of this call and only actually reserve the seat once the webhook confirms payment (right now the seat is reserved optimistically; see the note in `docs/SECURITY.md` about tightening this).
5. Creates the `Member` row, increments `occupiedSlots`, flips `status` to `"FULL"` if that was the last seat, and notifies the owner.

### Leaving a group
`POST /api/subscriptions/:id/leave` deactivates the membership and decrements `occupiedSlots`, reopening the seat.

## Coupons & referrals

- `Coupon` rows support percent-off or flat amount-off, an optional expiry, and a max-redemption cap; `join` applies a coupon code if present and increments `timesRedeemed`.
- `User.referralCode` / `referredById` are modeled but the discount-on-signup logic isn't wired up yet — a natural place to add it is inside `POST /api/auth/register`, crediting the referrer's wallet once the referred user's first payment succeeds.

## Invoices

`Payment.invoiceUrl` is reserved for a generated PDF receipt (e.g. via the `pdf` tooling used elsewhere, or a service like Invoice Ninja / a Stripe-hosted invoice link) — not yet generated automatically.

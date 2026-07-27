# Security

## Implemented

| Concern | Where |
|---|---|
| Password hashing | bcrypt, cost 12 (`app/api/auth/register`, `reset-password`) |
| Rate limiting | `lib/rate-limit.ts`, applied to register / forgot-password / create-subscription |
| Input validation | Zod schemas in `lib/validators.ts`, used on both client forms and API routes |
| XSS | React escapes output by default; CSP header set in `next.config.mjs` |
| SQL injection | Prisma parameterizes all queries; the one raw query (`admin/analytics`) uses a tagged template, not string concatenation |
| Security headers | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP — see `next.config.mjs` |
| Session security | JWT sessions via NextAuth, `NEXTAUTH_SECRET` required, 30-day max age |
| Route protection | `middleware.ts` gates `/dashboard` and `/admin` (role check) at the edge |
| Account enumeration | Login and forgot-password return generic/identical messages regardless of whether the account exists |
| Audit logging | `AuditLog` model, written on sign-in, registration, and admin actions |
| Webhook integrity | Stripe (HMAC via SDK) and Razorpay (HMAC-SHA256) signatures are verified before trusting a webhook payload |
| 2FA | TOTP via `otplib` (see `docs/AUTH_FLOW.md`) |

## Before production — a checklist

1. **CSRF**: NextAuth's built-in CSRF token covers its own endpoints. For any custom form POSTing to your own API routes from a browser (not just fetch from your own pages), add the `csrf` double-submit pattern or rely on `SameSite=Lax` cookies + checking `Origin`/`Referer` headers in the route handler.
2. **Rate limiting at scale**: `lib/rate-limit.ts` is in-memory and per-instance. On serverless/multi-instance deployments, swap it for Redis (Upstash's `@upstash/ratelimit` is a drop-in fit).
3. **PayPal webhook verification is stubbed** (`app/api/payments/webhook/paypal/route.ts`) — wire up the real `/v1/notifications/verify-webhook-signature` call before accepting real PayPal payments.
4. **Optimistic seat reservation**: `join` currently reserves the seat in the same transaction as creating a `PENDING` gateway payment. If the gateway payment then fails, the seat stays reserved. Add a cleanup job (or move seat reservation to the webhook success handler) before relying on this for paid gateways.
5. **2FA isn't enforced at login yet** — the setup/verify/disable endpoints exist, but `authorize()` doesn't currently challenge for a TOTP code. See `docs/AUTH_FLOW.md`.
6. **Secrets**: rotate every value in `.env.example` — none of the placeholders are safe defaults.
7. **Dependency scanning**: run `npm audit` / Snyk / Dependabot in CI; a few packages here (e.g. `otplib`) show deprecation warnings for sub-dependencies and should be revisited periodically.
8. **File uploads**: none exist yet (e.g. avatar upload) — if you add one, validate MIME type + size server-side and store outside the web root or in object storage (S3/R2), not on the app filesystem.

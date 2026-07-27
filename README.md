# NexSeat

Split the cost of AI tool subscriptions with a group — only where the provider's terms allow shared seats.

> **⚠️ Before you launch:** most consumer AI subscriptions (ChatGPT Plus, Claude Pro, Gemini Advanced, Midjourney's individual plans, etc.) prohibit sharing a single seat across unrelated people in their Terms of Service. Only Team/Business tiers are usually built for multiple seats. `Subscription.tosAcknowledged` requires hosts to confirm this, but that's a checkbox, not a compliance guarantee — review each provider's current ToS yourself before operating this platform with real users and real money.

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Radix/shadcn-style UI, Lucide icons |
| Backend | Next.js Route Handlers, Prisma ORM, PostgreSQL |
| Auth | NextAuth (Credentials + Google + GitHub), JWT sessions, bcrypt, TOTP 2FA |
| Payments | Stripe, PayPal, Razorpay, JazzCash (Pakistan), internal wallet |
| Infra | Docker, docker-compose |

## Quick start (local dev)

```bash
git clone <this-repo> nexseat && cd nexseat
cp .env.example .env          # fill in DATABASE_URL, NEXTAUTH_SECRET, OAuth keys, etc.
npm install                   # runs `prisma generate` via postinstall
npm run db:push               # create tables from prisma/schema.prisma
npm run db:seed               # optional: seed an admin + demo groups
npm run dev                   # http://localhost:3000
```

Seeded accounts (from `npm run db:seed`):
- `admin@nexseat.app` / `Password123` (role: ADMIN)
- `host@nexseat.app` / `Password123` (hosts 4 demo groups)

## Documentation

- [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md) — where everything lives and why
- [`docs/AUTH_FLOW.md`](docs/AUTH_FLOW.md) — registration, verification, login, OAuth, 2FA, sessions
- [`docs/PAYMENT_FLOW.md`](docs/PAYMENT_FLOW.md) — wallet, gateway checkout, webhooks, joining a group
- [`docs/SECURITY.md`](docs/SECURITY.md) — what's implemented and what to add before production
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Docker, Vercel, and managed Postgres options

## What's implemented vs. stubbed

This is a real, running codebase (not just UI mockups) covering the full request end to end, but a project this size always has a line between "production-quality core" and "swap in your own credentials/business logic." Implemented in full:

- Data model for every entity in the brief (Users, Subscriptions, Members, Payments, Notifications, Reviews, Coupons, Support Tickets, Audit Log, Platform Settings)
- Registration + email verification + login (credentials, Google, GitHub) + forgot/reset password + TOTP 2FA + JWT sessions + role-based route protection
- Subscription CRUD, atomic join/leave (race-condition-safe seat allocation via a DB transaction), coupon codes, wallet debits
- Stripe/PayPal/Razorpay/JazzCash payment confirmation: Stripe, Razorpay, and JazzCash have signature verification fully wired (HMAC checks); PayPal's verification call is stubbed — see `docs/PAYMENT_FLOW.md`. JazzCash is fully implemented end-to-end (signed checkout request + return-URL confirmation), since it uses a different integration pattern than the others.
- Admin panel: analytics with a revenue chart, user management (promote/revoke admin), subscription moderation (pause/cancel)
- Rate limiting, input validation (Zod, shared client/server), password hashing, security headers, CSP, audit logging
- Responsive, animated, dark/light UI with a signature "seat meter" component reused across the app

Deliberately left as extension points, documented inline in the relevant files:
- Real Stripe Checkout Session / PayPal order / Razorpay order creation on the client side of the wallet top-up flow (the API route returns a placeholder `checkoutUrl`)
- Group chat is modeled (`Message` table) but has no realtime transport wired up yet (see `docs/DEPLOYMENT.md` for a Pusher/Ably suggestion)
- Redis-backed rate limiting for multi-instance deployments (currently in-memory, fine for a single instance)
- CI pipeline, automated tests

## License

Provided as a starting point for your own product — review licensing terms of any third-party AI subscription before reselling access to it.

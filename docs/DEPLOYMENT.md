# Deployment guide

## Option A — Docker (self-hosted / any VPS)

```bash
cp .env.example .env   # fill in real secrets
docker compose up --build -d
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed   # optional
```

This brings up Postgres + the app behind `docker-compose.yml`. Put a reverse proxy (Caddy, nginx, or a platform load balancer) in front of port 3000 for TLS.

## Option B — Vercel + managed Postgres

1. Push this repo to GitHub and import it into Vercel.
2. Provision Postgres (Vercel Postgres, Neon, or Supabase all work) and set `DATABASE_URL` in Vercel's project environment variables.
3. Set every variable from `.env.example` in Vercel's dashboard (Production + Preview).
4. Vercel runs `npm install` (which triggers `prisma generate` via `postinstall`) and `npm run build` automatically. Run `npx prisma migrate deploy` once against the production database (locally, pointed at the prod `DATABASE_URL`, or via a one-off Vercel deployment hook).
5. Update OAuth app callback URLs (Google/GitHub) and payment webhook URLs (Stripe/PayPal/Razorpay) to your production domain.

## Environment variables

See `.env.example` for the full list. At minimum for a working deploy you need: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `JWT_SECRET`. Everything else (OAuth, email, payment gateways) can be added incrementally — features degrade gracefully (e.g. `lib/discord.ts` no-ops if `DISCORD_WEBHOOK_URL` is unset) rather than crashing.

## Database migrations

- Local dev: `npm run db:push` (fast iteration, no migration history)
- Once your schema stabilizes: `npm run db:migrate` to generate a versioned migration, then `npx prisma migrate deploy` in every environment after that.

## Realtime updates (group chat, live seat counts)

Not wired up in this scaffold. `Message` is modeled in Prisma, and the UI's `SlotGauge` already reacts to prop changes — the remaining piece is a transport. Two solid options:
- **Pusher / Ably**: managed pub-sub, minimal ops burden, easiest to add to a Vercel deployment.
- **Postgres LISTEN/NOTIFY + a WebSocket server**: more control, but needs a long-running Node process (doesn't fit serverless Vercel functions — pair with a small separate service, e.g. on Fly.io or Railway).

## Caching & performance

- Images: use `next/image` for any user-uploaded avatars/logos (already configured for Google/GitHub avatar domains in `next.config.mjs`).
- The marketing home page's tool grid is currently static seed data client-side (`components/home/tools-section.tsx`) for fast first paint; swap in a server-fetched call to `GET /api/subscriptions` when you want it live.
- Consider Next.js's `revalidate`/ISR for the group detail page (`app/groups/[id]/page.tsx`) since group data changes infrequently relative to page views.

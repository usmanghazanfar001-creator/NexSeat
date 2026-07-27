# Folder structure

```
nexseat/
├── app/
│   ├── layout.tsx                  # Root layout: fonts, metadata/SEO, Providers
│   ├── providers.tsx               # SessionProvider + ThemeProvider (dark/light)
│   ├── globals.css                 # Tailwind layers + CSS variable design tokens
│   ├── page.tsx                    # Marketing home page (hero, tools, pricing, FAQ)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── groups/[id]/page.tsx         # Public group detail page
│   ├── dashboard/
│   │   ├── layout.tsx               # Sidebar + auth-gated shell (see middleware.ts)
│   │   ├── page.tsx                 # Overview: wallet, hosted/joined groups
│   │   ├── wallet/page.tsx
│   │   └── notifications/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Revenue chart + platform stats
│   │   ├── users/page.tsx
│   │   └── subscriptions/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts   # NextAuth handler (credentials + OAuth)
│       │   ├── register/route.ts
│       │   ├── verify/route.ts
│       │   ├── forgot-password/route.ts
│       │   ├── reset-password/route.ts
│       │   └── 2fa/{setup,verify,disable}/route.ts
│       ├── subscriptions/
│       │   ├── route.ts                  # GET list (search/sort/paginate), POST create
│       │   └── [id]/{join,leave,reviews}/route.ts
│       ├── wallet/route.ts
│       ├── payments/webhook/{stripe,paypal,razorpay}/route.ts
│       ├── notifications/route.ts
│       ├── support-tickets/route.ts
│       └── admin/{users,subscriptions,analytics}/route.ts
│
├── components/
│   ├── ui/                          # Button, Card, Badge — shadcn-style primitives
│   ├── layout/                      # Navbar, Footer, Sidebar
│   ├── home/                        # Hero, ToolCard, SlotGauge (signature component), Pricing, Faq, Testimonials
│   └── dashboard/                   # RevenueChart, etc.
│
├── lib/
│   ├── prisma.ts                    # Singleton PrismaClient
│   ├── auth.ts                      # NextAuth config
│   ├── validators.ts                # Shared Zod schemas (client + server)
│   ├── utils.ts                     # cn(), formatCurrency, computeSeatPrice, etc.
│   ├── rate-limit.ts                # In-memory sliding-window limiter
│   ├── mail.ts                      # nodemailer wrappers (verify/reset/OTP emails)
│   └── discord.ts                   # Admin alert webhook
│
├── prisma/
│   ├── schema.prisma                # Full data model
│   └── seed.ts                      # Demo admin/host/subscriptions
│
├── middleware.ts                    # Protects /dashboard/** and /admin/**
├── next.config.mjs                  # Security headers, CSP, standalone output
├── tailwind.config.ts               # Design tokens (colors, fonts, gradient, animations)
├── Dockerfile / docker-compose.yml
└── docs/                            # This folder
```

## Why this layout

- **Route co-location**: each `app/api/**/route.ts` sits next to the page that calls it conceptually, but all API logic is kept thin — validation via `lib/validators.ts`, data access via `lib/prisma.ts` — so routes stay readable.
- **`components/home` vs `components/ui`**: `ui/` holds generic, unopinionated primitives (Button, Card) that any page could use; `home/` holds page-specific composition (Hero, ToolCard) that would be odd to reuse elsewhere.
- **`middleware.ts` over per-page checks**: centralizing the auth/role gate in one file means new pages under `/dashboard` or `/admin` are protected automatically, rather than each page remembering to check `getServerSession`.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const subscriptions = await prisma.subscription.findMany({
    include: {
      owner: { select: { name: true, email: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ subscriptions });
}

const createSchema = z.object({
  platform: z.string().min(2).max(60),
  category: z.string().min(2),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  monthlyPrice: z.number().positive(),
  yearlyPrice: z.number().positive().optional(),
  availableSlots: z.number().int().min(1).max(50),
  rating: z.number().min(0).max(5).optional(),
  isPopular: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  searchKeywords: z.array(z.string()).optional(),
  terms: z.string().optional(),
  refundPolicy: z.string().optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
  // When set, this is a "duplicate" request — clone all fields from an
  // existing listing as a starting point, then apply the fields above.
  duplicateFromId: z.string().optional(),
});

// POST /api/admin/subscriptions - admin creates a new listing (or duplicates one)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { duplicateFromId, ...fields } = parsed.data;

  let baseData: Record<string, unknown> = {};
  if (duplicateFromId) {
    const source = await prisma.subscription.findUnique({ where: { id: duplicateFromId } });
    if (source) {
      baseData = {
        description: source.description,
        websiteUrl: source.websiteUrl,
        logoUrl: source.logoUrl,
        bannerUrl: source.bannerUrl,
        rating: source.rating,
        tags: source.tags,
        searchKeywords: source.searchKeywords,
        faqs: source.faqs ?? undefined,
        terms: source.terms,
        refundPolicy: source.refundPolicy,
        supportEmail: source.supportEmail,
        category: source.category,
      };
    }
  }

  const subscription = await prisma.subscription.create({
    data: {
      ...baseData,
      ...fields,
      ownerId: session.user.id,
      renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      tosAcknowledged: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: duplicateFromId ? "ADMIN_DUPLICATED_SUBSCRIPTION" : "ADMIN_CREATED_SUBSCRIPTION",
      metadata: { subscriptionId: subscription.id },
    },
  });

  return NextResponse.json({ subscription }, { status: 201 });
}

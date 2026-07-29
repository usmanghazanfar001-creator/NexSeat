import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["ACTIVE", "FULL", "PAUSED", "CANCELLED"]).optional(),
  platform: z.string().min(2).max(60).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  monthlyPrice: z.number().positive().optional(),
  yearlyPrice: z.number().positive().optional().nullable(),
  availableSlots: z.number().int().min(1).max(50).optional(),
  rating: z.number().min(0).max(5).optional(),
  isPopular: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  searchKeywords: z.array(z.string()).optional(),
  terms: z.string().optional(),
  refundPolicy: z.string().optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
});

// Admins can pause/cancel a listing, e.g. after a ToS complaint from a provider,
// or edit any catalog field (pricing, seats, badges, description, etc.).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const subscription = await prisma.subscription.update({ where: { id }, data: parsed.data });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ADMIN_UPDATED_SUBSCRIPTION",
      metadata: { subscriptionId: id, changes: parsed.data },
    },
  });

  return NextResponse.json({ subscription });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.subscription.delete({ where: { id } });
  return NextResponse.json({ message: "Subscription removed" });
}

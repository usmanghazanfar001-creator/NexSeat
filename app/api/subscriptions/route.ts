import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubscriptionSchema } from "@/lib/validators";
import { rateLimitByIp } from "@/lib/rate-limit";

// GET /api/subscriptions?search=&platform=&sort=price_asc|price_desc|newest&page=1
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const sort = searchParams.get("sort") ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = 12;

  const orderBy =
    sort === "price_asc"
      ? { monthlyPrice: "asc" as const }
      : sort === "price_desc"
      ? { monthlyPrice: "desc" as const }
      : { createdAt: "desc" as const };

  const where = {
    status: "ACTIVE" as const,
    ...(search
      ? { platform: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        owner: { select: { name: true, avatar: true } },
        _count: { select: { members: true } },
      },
    }),
    prisma.subscription.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

// POST /api/subscriptions - create a new subscription group (must be logged in)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimitByIp(ip, "create-subscription", 10, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
  }

  const parsed = createSubscriptionSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const subscription = await prisma.subscription.create({
    data: { ...parsed.data, ownerId: session.user.id },
  });

  return NextResponse.json({ subscription }, { status: 201 });
}

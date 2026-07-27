import { NextRequest, NextResponse } from "next/server";
import { authenticator } from "otplib";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ code: z.string().length(6) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (!user.twoFactorSecret) {
    return NextResponse.json({ error: "Start setup first" }, { status: 400 });
  }

  const valid = authenticator.check(parsed.data.code, user.twoFactorSecret);
  if (!valid) return NextResponse.json({ error: "Incorrect code" }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });

  return NextResponse.json({ message: "Two-factor authentication enabled" });
}

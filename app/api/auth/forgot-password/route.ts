import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimitByIp } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/mail";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimitByIp(ip, "forgot-password", 5, 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });

  // Always return the same response whether or not the account exists,
  // so this endpoint can't be used to enumerate registered emails.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        type: "PASSWORD_RESET",
        expires: new Date(Date.now() + 1000 * 60 * 30), // 30 min
      },
    });
    await sendPasswordResetEmail(user.email, token);
  }

  return NextResponse.json({
    message: "If an account exists for that email, a reset link has been sent.",
  });
}

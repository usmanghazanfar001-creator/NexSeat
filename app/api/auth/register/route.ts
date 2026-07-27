import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { rateLimitByIp } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limited = rateLimitByIp(ip, "register", 5, 60_000); // 5/min per IP
    if (!limited.success) {
      return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      // Generic message: never confirm which field ("email") already exists.
      return NextResponse.json({ error: "Unable to create account with these details" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: passwordHash },
    });

    // Issue a single-use, expiring email verification token.
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        type: "EMAIL_VERIFY",
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h
      },
    });

    await sendVerificationEmail(user.email, token);

    await prisma.auditLog.create({
      data: { userId: user.id, action: "USER_REGISTERED", ipAddress: ip },
    });

    return NextResponse.json(
      { message: "Account created. Check your email to verify your account." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REGISTER_ERROR]", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

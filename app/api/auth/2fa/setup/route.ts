import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Step 1 of enabling 2FA: generate a TOTP secret and return an otpauth:// URI
// the client renders as a QR code (e.g. with the `qrcode` package) for
// Google Authenticator / Authy. The secret isn't persisted as "enabled"
// until the user confirms a code in /2fa/verify.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(session.user.email ?? session.user.id, "NexSeat", secret);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: secret }, // twoFactorEnabled stays false until verified
  });

  return NextResponse.json({ otpauth, secret });
}

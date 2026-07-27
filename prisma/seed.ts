import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nexseat.app" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nexseat.app",
      password: passwordHash,
      role: "ADMIN",
      verified: true,
      wallet: 100,
    },
  });

  const host = await prisma.user.upsert({
    where: { email: "host@nexseat.app" },
    update: {},
    create: {
      name: "Hana Host",
      email: "host@nexseat.app",
      password: passwordHash,
      verified: true,
      wallet: 20,
    },
  });

  const platforms = [
    { platform: "ChatGPT Plus", monthlyPrice: 20, availableSlots: 5, occupiedSlots: 3 },
    { platform: "Claude Pro", monthlyPrice: 20, availableSlots: 4, occupiedSlots: 2 },
    { platform: "Gemini Advanced", monthlyPrice: 19.99, availableSlots: 5, occupiedSlots: 1 },
    { platform: "Cursor Pro", monthlyPrice: 20, availableSlots: 5, occupiedSlots: 0 },
  ];

  for (const p of platforms) {
    await prisma.subscription.create({
      data: {
        ...p,
        ownerId: host.id,
        renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        tosAcknowledged: true,
      },
    });
  }

  await prisma.platformSetting.upsert({
    where: { key: "PLATFORM_FEE_PERCENT" },
    update: {},
    create: { key: "PLATFORM_FEE_PERCENT", value: "5" },
  });

  console.log("Seeded:", { admin: admin.email, host: host.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

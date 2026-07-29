import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catalog seed — Cloud Storage + Collaboration tools batch.
 * Run with: npx tsx prisma/seed-catalog-cloud-collab.ts
 * Safe to re-run: skips any platform that already exists.
 *
 * IMPORTANT: pricing below is a realistic reference at time of writing,
 * NOT guaranteed current. Verify against each provider's pricing page
 * before enabling a listing for real users.
 */

type ToolSeed = {
  platform: string;
  category: string;
  description: string;
  websiteUrl: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  availableSlots: number;
  rating: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  tags: string[];
  searchKeywords: string[];
  supportEmail?: string;
  faqs: { question: string; answer: string }[];
  terms: string;
  refundPolicy: string;
};

const CLOUD_AND_COLLAB: ToolSeed[] = [
  {
    platform: "Google Workspace",
    category: "Cloud Storage",
    description: "Business email, cloud storage, Docs, Sheets, Meet, and Drive in one subscription.",
    websiteUrl: "https://workspace.google.com",
    monthlyPrice: 12,
    availableSlots: 5,
    rating: 4.5,
    isPopular: true,
    tags: ["cloud-storage", "email", "docs"],
    searchKeywords: ["google workspace", "gsuite", "google drive business"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Google Workspace's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Dropbox Business",
    category: "Cloud Storage",
    description: "Secure cloud storage and file sharing with advanced admin controls and sync.",
    websiteUrl: "https://www.dropbox.com/business",
    monthlyPrice: 18,
    availableSlots: 5,
    rating: 4.2,
    tags: ["cloud-storage", "file-sharing"],
    searchKeywords: ["dropbox", "dropbox business", "cloud storage"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Dropbox's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "OneDrive for Business",
    category: "Cloud Storage",
    description: "Microsoft's cloud storage with Office integration and enterprise-grade security.",
    websiteUrl: "https://www.microsoft.com/microsoft-365/onedrive/onedrive-for-business",
    monthlyPrice: 10,
    availableSlots: 5,
    rating: 4.1,
    tags: ["cloud-storage", "microsoft"],
    searchKeywords: ["onedrive", "onedrive for business", "microsoft cloud storage"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Microsoft's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Box Business",
    category: "Cloud Storage",
    description: "Enterprise content management and secure file collaboration platform.",
    websiteUrl: "https://www.box.com",
    monthlyPrice: 20,
    availableSlots: 4,
    rating: 4.0,
    tags: ["cloud-storage", "enterprise", "content-management"],
    searchKeywords: ["box", "box business", "enterprise file storage"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Box's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Zoom Pro",
    category: "Collaboration",
    description: "Video conferencing with longer meeting limits, cloud recording, and admin controls.",
    websiteUrl: "https://zoom.us",
    monthlyPrice: 15.99,
    availableSlots: 5,
    rating: 4.5,
    isPopular: true,
    tags: ["collaboration", "video-calls", "meetings"],
    searchKeywords: ["zoom", "zoom pro", "video conferencing"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Zoom's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Loom Business",
    category: "Collaboration",
    description: "Async video messaging for screen recordings, tutorials, and team updates.",
    websiteUrl: "https://www.loom.com",
    monthlyPrice: 12.50,
    availableSlots: 6,
    rating: 4.4,
    tags: ["collaboration", "screen-recording", "async-video"],
    searchKeywords: ["loom", "loom business", "screen recorder"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Loom's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Calendly Premium",
    category: "Collaboration",
    description: "Automated scheduling tool with calendar sync, reminders, and team booking pages.",
    websiteUrl: "https://calendly.com",
    monthlyPrice: 12,
    availableSlots: 6,
    rating: 4.5,
    tags: ["collaboration", "scheduling"],
    searchKeywords: ["calendly", "calendly premium", "scheduling tool"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Calendly's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Microsoft 365",
    category: "Collaboration",
    description: "Word, Excel, PowerPoint, Outlook, and Teams bundled with cloud storage.",
    websiteUrl: "https://www.microsoft.com/microsoft-365",
    monthlyPrice: 9.99,
    availableSlots: 5,
    rating: 4.4,
    isPopular: true,
    tags: ["collaboration", "office", "microsoft"],
    searchKeywords: ["microsoft 365", "office 365", "ms office"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Microsoft's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
];

async function seedCatalog() {
  const host =
    (await prisma.user.findUnique({ where: { email: "host@nexseat.app" } })) ??
    (await prisma.user.findFirst({ where: { role: "ADMIN" } }));

  if (!host) {
    throw new Error("No host or admin user found. Run `npm run db:seed` first, then re-run this script.");
  }

  let created = 0;
  let skipped = 0;

  for (const tool of CLOUD_AND_COLLAB) {
    const existing = await prisma.subscription.findFirst({ where: { platform: tool.platform } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.subscription.create({
      data: {
        platform: tool.platform,
        category: tool.category,
        description: tool.description,
        websiteUrl: tool.websiteUrl,
        monthlyPrice: tool.monthlyPrice,
        yearlyPrice: tool.yearlyPrice,
        availableSlots: tool.availableSlots,
        rating: tool.rating,
        isPopular: tool.isPopular ?? false,
        isFeatured: tool.isFeatured ?? false,
        tags: tool.tags,
        searchKeywords: tool.searchKeywords,
        faqs: tool.faqs,
        terms: tool.terms,
        refundPolicy: tool.refundPolicy,
        supportEmail: tool.supportEmail ?? "support@nexseat.shop",
        ownerId: host.id,
        renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        tosAcknowledged: true,
      },
    });
    created++;
  }

  console.log(`Cloud Storage + Collaboration catalog seed complete: ${created} created, ${skipped} skipped (already existed).`);
}

seedCatalog()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

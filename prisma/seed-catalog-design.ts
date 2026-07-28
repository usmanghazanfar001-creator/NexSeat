import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catalog seed — Design tools batch.
 * Run with: npx tsx prisma/seed-catalog-design.ts
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

const DESIGN: ToolSeed[] = [
  {
    platform: "Canva Pro",
    category: "Design",
    description: "Drag-and-drop design tool with premium templates, brand kits, background remover, and stock assets.",
    websiteUrl: "https://www.canva.com",
    monthlyPrice: 12.99,
    availableSlots: 5,
    rating: 4.7,
    isPopular: true,
    tags: ["design", "graphics", "templates"],
    searchKeywords: ["canva", "canva pro", "graphic design"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Canva's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Figma Professional",
    category: "Design",
    description: "Collaborative interface design tool with unlimited files, version history, and team libraries.",
    websiteUrl: "https://www.figma.com",
    monthlyPrice: 15,
    availableSlots: 4,
    rating: 4.8,
    isPopular: true,
    tags: ["design", "ui-ux", "prototyping"],
    searchKeywords: ["figma", "figma pro", "ui design"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Figma's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Adobe Creative Cloud",
    category: "Design",
    description: "Full suite including Photoshop, Illustrator, Premiere Pro, and 20+ creative apps.",
    websiteUrl: "https://www.adobe.com/creativecloud.html",
    monthlyPrice: 59.99,
    availableSlots: 4,
    rating: 4.5,
    isPopular: true,
    tags: ["design", "photo-editing", "video-editing"],
    searchKeywords: ["adobe", "creative cloud", "photoshop", "illustrator", "premiere"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Adobe's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Framer",
    category: "Design",
    description: "Website design and publishing tool with AI-assisted layout generation and CMS.",
    websiteUrl: "https://www.framer.com",
    monthlyPrice: 20,
    availableSlots: 5,
    rating: 4.4,
    tags: ["design", "website-builder", "no-code"],
    searchKeywords: ["framer", "website builder", "no code design"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Framer's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Sketch",
    category: "Design",
    description: "Mac-native digital design toolkit for UI, web, and icon design with cloud collaboration.",
    websiteUrl: "https://www.sketch.com",
    monthlyPrice: 12,
    availableSlots: 5,
    rating: 4.2,
    tags: ["design", "ui-ux", "mac"],
    searchKeywords: ["sketch", "sketch app", "mac design tool"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Sketch's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Miro",
    category: "Design",
    description: "Online collaborative whiteboard for brainstorming, diagramming, and workshop facilitation.",
    websiteUrl: "https://miro.com",
    monthlyPrice: 10,
    availableSlots: 6,
    rating: 4.5,
    tags: ["design", "whiteboard", "collaboration"],
    searchKeywords: ["miro", "whiteboard", "brainstorming tool"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Miro's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Lucidchart",
    category: "Design",
    description: "Diagramming and flowchart tool for org charts, process maps, and technical diagrams.",
    websiteUrl: "https://www.lucidchart.com",
    monthlyPrice: 9,
    availableSlots: 5,
    rating: 4.3,
    tags: ["design", "diagrams", "flowcharts"],
    searchKeywords: ["lucidchart", "flowchart tool", "diagramming"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Lucidchart's terms.",
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

  for (const tool of DESIGN) {
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

  console.log(`Design catalog seed complete: ${created} created, ${skipped} skipped (already existed).`);
}

seedCatalog()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

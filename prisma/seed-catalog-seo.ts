import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catalog seed — SEO tools batch.
 * Run with: npx tsx prisma/seed-catalog-seo.ts
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

const SEO: ToolSeed[] = [
  {
    platform: "Ahrefs",
    category: "SEO",
    description: "Comprehensive SEO toolset for backlink analysis, keyword research, and site audits.",
    websiteUrl: "https://ahrefs.com",
    monthlyPrice: 129,
    availableSlots: 3,
    rating: 4.7,
    isPopular: true,
    tags: ["seo", "backlinks", "keyword-research"],
    searchKeywords: ["ahrefs", "backlink checker", "seo tool"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Ahrefs' terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Semrush",
    category: "SEO",
    description: "All-in-one marketing toolkit for SEO, PPC, content, and competitor research.",
    websiteUrl: "https://www.semrush.com",
    monthlyPrice: 139.95,
    availableSlots: 3,
    rating: 4.6,
    isPopular: true,
    tags: ["seo", "ppc", "competitor-research"],
    searchKeywords: ["semrush", "seo toolkit", "competitor analysis"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Semrush's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Surfer SEO",
    category: "SEO",
    description: "Content optimization tool that scores pages against top-ranking competitors in real time.",
    websiteUrl: "https://surferseo.com",
    monthlyPrice: 89,
    availableSlots: 4,
    rating: 4.5,
    tags: ["seo", "content-optimization"],
    searchKeywords: ["surfer seo", "content optimization tool"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Surfer's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Moz Pro",
    category: "SEO",
    description: "SEO software suite with rank tracking, site audits, and the Domain Authority metric.",
    websiteUrl: "https://moz.com",
    monthlyPrice: 99,
    availableSlots: 4,
    rating: 4.2,
    tags: ["seo", "rank-tracking"],
    searchKeywords: ["moz", "moz pro", "domain authority"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Moz's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Ubersuggest",
    category: "SEO",
    description: "Budget-friendly SEO tool for keyword ideas, content suggestions, and site audits.",
    websiteUrl: "https://neilpatel.com/ubersuggest",
    monthlyPrice: 29,
    availableSlots: 6,
    rating: 4.0,
    tags: ["seo", "keyword-research", "budget"],
    searchKeywords: ["ubersuggest", "neil patel seo tool"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Ubersuggest's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "SE Ranking",
    category: "SEO",
    description: "Affordable all-in-one SEO platform with rank tracking, audits, and competitor analysis.",
    websiteUrl: "https://seranking.com",
    monthlyPrice: 65,
    availableSlots: 4,
    rating: 4.3,
    tags: ["seo", "rank-tracking", "budget"],
    searchKeywords: ["se ranking", "seranking"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with SE Ranking's terms.",
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

  for (const tool of SEO) {
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

  console.log(`SEO catalog seed complete: ${created} created, ${skipped} skipped (already existed).`);
}

seedCatalog()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catalog seed — Writing tools batch.
 * Run with: npx tsx prisma/seed-catalog-writing.ts
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

const WRITING: ToolSeed[] = [
  {
    platform: "Grammarly Premium",
    category: "Writing",
    description: "AI writing assistant for grammar, tone, clarity, and plagiarism checking across the web.",
    websiteUrl: "https://www.grammarly.com",
    monthlyPrice: 12,
    availableSlots: 5,
    rating: 4.6,
    isPopular: true,
    tags: ["writing", "grammar", "editing"],
    searchKeywords: ["grammarly", "grammarly premium", "grammar checker"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Grammarly's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Jasper AI",
    category: "Writing",
    description: "AI content generation platform for marketing copy, blog posts, and brand voice consistency.",
    websiteUrl: "https://www.jasper.ai",
    monthlyPrice: 39,
    availableSlots: 4,
    rating: 4.3,
    tags: ["writing", "ai", "marketing-copy"],
    searchKeywords: ["jasper", "jasper ai", "ai copywriting"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Jasper's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Copy.ai",
    category: "Writing",
    description: "AI copywriting tool for ads, emails, product descriptions, and social media content.",
    websiteUrl: "https://www.copy.ai",
    monthlyPrice: 36,
    availableSlots: 4,
    rating: 4.1,
    tags: ["writing", "ai", "copywriting"],
    searchKeywords: ["copy.ai", "copyai", "ai content writer"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Copy.ai's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Writesonic",
    category: "Writing",
    description: "AI writing platform for SEO articles, ad copy, and chat-based content generation.",
    websiteUrl: "https://writesonic.com",
    monthlyPrice: 19,
    availableSlots: 5,
    rating: 4.0,
    tags: ["writing", "ai", "seo-content"],
    searchKeywords: ["writesonic", "ai article writer"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Writesonic's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Notion AI",
    category: "Writing",
    description: "AI writing and summarization built into Notion workspaces for notes, docs, and wikis.",
    websiteUrl: "https://www.notion.so/product/ai",
    monthlyPrice: 10,
    availableSlots: 6,
    rating: 4.4,
    isPopular: true,
    tags: ["writing", "ai", "productivity"],
    searchKeywords: ["notion ai", "notion", "ai notes"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Notion's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "QuillBot Premium",
    category: "Writing",
    description: "AI paraphrasing, grammar checking, and summarization tool for students and professionals.",
    websiteUrl: "https://quillbot.com",
    monthlyPrice: 9.95,
    availableSlots: 6,
    rating: 4.3,
    tags: ["writing", "paraphrasing", "grammar"],
    searchKeywords: ["quillbot", "paraphrasing tool", "quillbot premium"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with QuillBot's terms.",
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

  for (const tool of WRITING) {
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

  console.log(`Writing catalog seed complete: ${created} created, ${skipped} skipped (already existed).`);
}

seedCatalog()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

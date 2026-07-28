import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catalog seed — Video tools batch.
 * Run with: npx tsx prisma/seed-catalog-video.ts
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

const VIDEO: ToolSeed[] = [
  {
    platform: "CapCut Pro",
    category: "Video",
    description: "Video editing app with AI effects, templates, and cloud storage for social media content.",
    websiteUrl: "https://www.capcut.com",
    monthlyPrice: 9.99,
    availableSlots: 5,
    rating: 4.5,
    isPopular: true,
    tags: ["video", "editing", "social-media"],
    searchKeywords: ["capcut", "capcut pro", "video editor"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with CapCut's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "VEED Pro",
    category: "Video",
    description: "Browser-based video editor with auto-subtitles, AI avatars, and brand kits.",
    websiteUrl: "https://www.veed.io",
    monthlyPrice: 24,
    availableSlots: 4,
    rating: 4.3,
    tags: ["video", "editing", "subtitles"],
    searchKeywords: ["veed", "veed.io", "online video editor"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with VEED's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Descript",
    category: "Video",
    description: "Edit video and podcasts by editing text; includes AI voice cloning and overdub.",
    websiteUrl: "https://www.descript.com",
    monthlyPrice: 24,
    availableSlots: 4,
    rating: 4.6,
    tags: ["video", "podcast", "transcription"],
    searchKeywords: ["descript", "podcast editor", "transcription editing"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Descript's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "InVideo",
    category: "Video",
    description: "AI-powered video creation platform with text-to-video and template library.",
    websiteUrl: "https://invideo.io",
    monthlyPrice: 20,
    availableSlots: 5,
    rating: 4.2,
    tags: ["video", "ai", "templates"],
    searchKeywords: ["invideo", "text to video", "ai video maker"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with InVideo's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Synthesia",
    category: "Video",
    description: "AI avatar video generator for training, marketing, and explainer videos from text.",
    websiteUrl: "https://www.synthesia.io",
    monthlyPrice: 29,
    availableSlots: 3,
    rating: 4.4,
    tags: ["video", "ai-avatar", "text-to-video"],
    searchKeywords: ["synthesia", "ai avatar video", "text to video ai"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Synthesia's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Runway",
    category: "Video",
    description: "AI video generation and editing suite with text-to-video, motion brush, and green screen tools.",
    websiteUrl: "https://runwayml.com",
    monthlyPrice: 35,
    availableSlots: 3,
    rating: 4.5,
    isPopular: true,
    tags: ["video", "ai", "generative"],
    searchKeywords: ["runway", "runwayml", "ai video generation"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Runway's terms.",
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

  for (const tool of VIDEO) {
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

  console.log(`Video catalog seed complete: ${created} created, ${skipped} skipped (already existed).`);
}

seedCatalog()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

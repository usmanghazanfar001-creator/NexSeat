import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catalog seed — Audio + Learning tools batch (final batch).
 * Run with: npx tsx prisma/seed-catalog-audio-learning.ts
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

const AUDIO_AND_LEARNING: ToolSeed[] = [
  {
    platform: "ElevenLabs",
    category: "Audio",
    description: "AI voice generator and cloning platform for narration, dubbing, and voiceovers.",
    websiteUrl: "https://elevenlabs.io",
    monthlyPrice: 22,
    availableSlots: 4,
    rating: 4.6,
    isPopular: true,
    tags: ["audio", "ai-voice", "text-to-speech"],
    searchKeywords: ["elevenlabs", "ai voice generator", "voice cloning"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with ElevenLabs' terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Suno",
    category: "Audio",
    description: "AI music generation platform for creating full songs from text prompts.",
    websiteUrl: "https://suno.com",
    monthlyPrice: 10,
    availableSlots: 6,
    rating: 4.5,
    isPopular: true,
    tags: ["audio", "ai-music", "generative"],
    searchKeywords: ["suno", "ai music generator", "suno ai"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Suno's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Epidemic Sound",
    category: "Audio",
    description: "Royalty-free music and sound effects library for content creators.",
    websiteUrl: "https://www.epidemicsound.com",
    monthlyPrice: 15,
    availableSlots: 6,
    rating: 4.4,
    tags: ["audio", "music-library", "royalty-free"],
    searchKeywords: ["epidemic sound", "royalty free music"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Epidemic Sound's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Artlist",
    category: "Audio",
    description: "Unlimited music, SFX, and video footage licensing for creators and businesses.",
    websiteUrl: "https://artlist.io",
    monthlyPrice: 16.60,
    availableSlots: 5,
    rating: 4.5,
    tags: ["audio", "music-library", "footage"],
    searchKeywords: ["artlist", "stock music", "royalty free footage"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Artlist's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Coursera Plus",
    category: "Learning",
    description: "Unlimited access to thousands of courses, certificates, and specializations.",
    websiteUrl: "https://www.coursera.org",
    monthlyPrice: 59,
    availableSlots: 4,
    rating: 4.6,
    isPopular: true,
    tags: ["learning", "courses", "certificates"],
    searchKeywords: ["coursera", "coursera plus", "online courses"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Coursera's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Udemy Business",
    category: "Learning",
    description: "Curated library of professional courses across tech, business, and creative skills.",
    websiteUrl: "https://business.udemy.com",
    monthlyPrice: 30,
    availableSlots: 5,
    rating: 4.3,
    tags: ["learning", "courses", "professional-development"],
    searchKeywords: ["udemy", "udemy business", "online learning"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Udemy's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "LinkedIn Learning",
    category: "Learning",
    description: "Professional courses taught by industry experts with LinkedIn profile integration.",
    websiteUrl: "https://www.linkedin.com/learning",
    monthlyPrice: 39.99,
    availableSlots: 4,
    rating: 4.4,
    tags: ["learning", "courses", "professional-development"],
    searchKeywords: ["linkedin learning", "lynda", "professional courses"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with LinkedIn's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Pluralsight",
    category: "Learning",
    description: "Technology skill development platform with hands-on labs and skill assessments.",
    websiteUrl: "https://www.pluralsight.com",
    monthlyPrice: 29,
    availableSlots: 5,
    rating: 4.3,
    tags: ["learning", "tech-skills", "certifications"],
    searchKeywords: ["pluralsight", "tech courses", "skill assessments"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Pluralsight's terms.",
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

  for (const tool of AUDIO_AND_LEARNING) {
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

  console.log(`Audio + Learning catalog seed complete: ${created} created, ${skipped} skipped (already existed).`);
}

seedCatalog()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

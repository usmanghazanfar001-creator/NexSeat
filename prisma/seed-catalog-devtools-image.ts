import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catalog seed — Developer Tools + AI Image Generation batch.
 * Run with: npx tsx prisma/seed-catalog-devtools-image.ts
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

const DEVTOOLS_AND_IMAGE: ToolSeed[] = [
  {
    platform: "GitHub Team",
    category: "Developer Tools",
    description: "Collaborative code hosting with protected branches, required reviews, and team management.",
    websiteUrl: "https://github.com",
    monthlyPrice: 4,
    availableSlots: 6,
    rating: 4.6,
    isPopular: true,
    tags: ["developer", "git", "hosting"],
    searchKeywords: ["github", "github team", "git hosting"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with GitHub's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "GitLab Premium",
    category: "Developer Tools",
    description: "DevOps platform with CI/CD, code review, and project management built in.",
    websiteUrl: "https://about.gitlab.com",
    monthlyPrice: 29,
    availableSlots: 4,
    rating: 4.3,
    tags: ["developer", "git", "devops"],
    searchKeywords: ["gitlab", "gitlab premium", "ci/cd"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with GitLab's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Bitbucket Premium",
    category: "Developer Tools",
    description: "Git repository hosting with built-in CI/CD pipelines and Jira integration.",
    websiteUrl: "https://bitbucket.org",
    monthlyPrice: 6,
    availableSlots: 6,
    rating: 4.1,
    tags: ["developer", "git", "atlassian"],
    searchKeywords: ["bitbucket", "bitbucket premium", "atlassian git"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Bitbucket's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Vercel Pro",
    category: "Developer Tools",
    description: "Frontend cloud platform for deploying Next.js and other web apps with edge functions.",
    websiteUrl: "https://vercel.com",
    monthlyPrice: 20,
    availableSlots: 5,
    rating: 4.7,
    isPopular: true,
    tags: ["developer", "hosting", "deployment"],
    searchKeywords: ["vercel", "vercel pro", "nextjs hosting"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Vercel's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Netlify Pro",
    category: "Developer Tools",
    description: "Web hosting and serverless platform with continuous deployment from Git.",
    websiteUrl: "https://www.netlify.com",
    monthlyPrice: 19,
    availableSlots: 5,
    rating: 4.5,
    tags: ["developer", "hosting", "deployment"],
    searchKeywords: ["netlify", "netlify pro", "jamstack hosting"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Netlify's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "DigitalOcean",
    category: "Developer Tools",
    description: "Cloud infrastructure with droplets, managed databases, and Kubernetes hosting.",
    websiteUrl: "https://www.digitalocean.com",
    monthlyPrice: 12,
    availableSlots: 5,
    rating: 4.5,
    tags: ["developer", "cloud", "hosting"],
    searchKeywords: ["digitalocean", "digital ocean", "cloud hosting"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with DigitalOcean's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Leonardo AI",
    category: "AI Image Generation",
    description: "AI image generation platform for game assets, concept art, and production-ready visuals.",
    websiteUrl: "https://leonardo.ai",
    monthlyPrice: 12,
    availableSlots: 5,
    rating: 4.4,
    tags: ["ai-image", "generative", "art"],
    searchKeywords: ["leonardo ai", "ai image generator"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Leonardo AI's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Ideogram",
    category: "AI Image Generation",
    description: "AI image generator known for accurate text rendering within generated images.",
    websiteUrl: "https://ideogram.ai",
    monthlyPrice: 8,
    availableSlots: 6,
    rating: 4.3,
    tags: ["ai-image", "generative", "text-in-image"],
    searchKeywords: ["ideogram", "ai image with text"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Ideogram's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Freepik AI Suite",
    category: "AI Image Generation",
    description: "AI image generation bundled with Freepik's stock photo and vector library.",
    websiteUrl: "https://www.freepik.com",
    monthlyPrice: 15,
    availableSlots: 6,
    rating: 4.2,
    tags: ["ai-image", "stock-photos", "generative"],
    searchKeywords: ["freepik", "freepik ai", "stock images"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Freepik's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Krea AI",
    category: "AI Image Generation",
    description: "Real-time AI image and video generation with enhancement and upscaling tools.",
    websiteUrl: "https://www.krea.ai",
    monthlyPrice: 24,
    availableSlots: 4,
    rating: 4.4,
    tags: ["ai-image", "generative", "real-time"],
    searchKeywords: ["krea", "krea ai", "real time ai image"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Krea AI's terms.",
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

  for (const tool of DEVTOOLS_AND_IMAGE) {
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

  console.log(`Developer Tools + AI Image catalog seed complete: ${created} created, ${skipped} skipped (already existed).`);
}

seedCatalog()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

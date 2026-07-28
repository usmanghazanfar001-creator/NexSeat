import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catalog seed — adds real subscription tools to the marketplace.
 *
 * Run standalone with: npx tsx prisma/seed-catalog.ts
 * Safe to re-run: uses upsert-style checks keyed on `platform`, so it never
 * creates duplicates and never overwrites an admin's manual edits.
 *
 * IMPORTANT: monthlyPrice / yearlyPrice below are realistic reference
 * prices at time of writing, NOT guaranteed current. Verify against each
 * provider's pricing page before enabling a listing for real users.
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

const AI_ASSISTANTS: ToolSeed[] = [
  {
    platform: "ChatGPT Plus",
    category: "AI Assistants",
    description: "OpenAI's flagship AI assistant with GPT-4 access, faster responses, and priority access to new features.",
    websiteUrl: "https://chat.openai.com",
    monthlyPrice: 20,
    availableSlots: 5,
    rating: 4.7,
    isPopular: true,
    tags: ["ai", "chatbot", "openai"],
    searchKeywords: ["chatgpt", "gpt-4", "openai", "chat gpt plus"],
    faqs: [
      { question: "Can I share a ChatGPT Plus seat?", answer: "OpenAI's individual Plus plan is licensed to one person. Group hosts on this platform must confirm they are using an eligible multi-seat plan before listing." },
      { question: "What happens if I leave the group?", answer: "You lose access at the end of the current billing cycle; any unused wallet balance is refundable." },
    ],
    terms: "Members agree to use the shared seat only for individual, non-commercial use consistent with OpenAI's usage policies.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Claude Pro",
    category: "AI Assistants",
    description: "Anthropic's Claude with higher usage limits, priority access, and early feature access.",
    websiteUrl: "https://claude.ai",
    monthlyPrice: 20,
    availableSlots: 4,
    rating: 4.8,
    isPopular: true,
    tags: ["ai", "chatbot", "anthropic"],
    searchKeywords: ["claude", "claude pro", "anthropic"],
    faqs: [
      { question: "Is Claude Pro sharing allowed?", answer: "Check Anthropic's current consumer terms before joining or hosting a group for this plan." },
    ],
    terms: "Members agree to individual, non-commercial use consistent with Anthropic's usage policies.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Gemini Advanced",
    category: "AI Assistants",
    description: "Google's Gemini Advanced with access to Google's most capable models via the Google One AI Premium plan.",
    websiteUrl: "https://gemini.google.com",
    monthlyPrice: 19.99,
    availableSlots: 5,
    rating: 4.5,
    tags: ["ai", "chatbot", "google"],
    searchKeywords: ["gemini", "gemini advanced", "google one ai", "bard"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Google's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Perplexity Pro",
    category: "AI Assistants",
    description: "AI-powered answer engine with real-time web search, file upload, and advanced model access.",
    websiteUrl: "https://www.perplexity.ai",
    monthlyPrice: 20,
    availableSlots: 6,
    rating: 4.6,
    tags: ["ai", "search", "research"],
    searchKeywords: ["perplexity", "perplexity pro", "ai search"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Perplexity's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Microsoft Copilot Pro",
    category: "AI Assistants",
    description: "AI assistant integrated across Microsoft 365 apps with priority access during peak times.",
    websiteUrl: "https://copilot.microsoft.com",
    monthlyPrice: 20,
    availableSlots: 5,
    rating: 4.3,
    tags: ["ai", "microsoft", "productivity"],
    searchKeywords: ["copilot", "microsoft copilot", "copilot pro"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Microsoft's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Grok",
    category: "AI Assistants",
    description: "xAI's conversational assistant with real-time knowledge via X (Twitter) integration.",
    websiteUrl: "https://x.ai",
    monthlyPrice: 16,
    availableSlots: 5,
    rating: 4.1,
    tags: ["ai", "chatbot", "xai"],
    searchKeywords: ["grok", "xai", "x premium"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with xAI's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
];

const AI_CODING: ToolSeed[] = [
  {
    platform: "Cursor Pro",
    category: "AI Coding",
    description: "AI-first code editor with advanced autocomplete, chat, and codebase-aware suggestions.",
    websiteUrl: "https://cursor.com",
    monthlyPrice: 20,
    availableSlots: 5,
    rating: 4.7,
    isPopular: true,
    tags: ["ai", "coding", "editor"],
    searchKeywords: ["cursor", "cursor pro", "ai code editor"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Cursor's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "GitHub Copilot",
    category: "AI Coding",
    description: "AI pair programmer with inline code suggestions across dozens of languages and IDEs.",
    websiteUrl: "https://github.com/features/copilot",
    monthlyPrice: 10,
    availableSlots: 5,
    rating: 4.5,
    isPopular: true,
    tags: ["ai", "coding", "github"],
    searchKeywords: ["github copilot", "copilot", "code completion"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with GitHub's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Windsurf",
    category: "AI Coding",
    description: "Agentic AI code editor (formerly Codeium's IDE) with autonomous multi-file editing.",
    websiteUrl: "https://windsurf.com",
    monthlyPrice: 15,
    availableSlots: 5,
    rating: 4.4,
    tags: ["ai", "coding", "editor"],
    searchKeywords: ["windsurf", "codeium editor"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Windsurf's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Replit Core",
    category: "AI Coding",
    description: "Cloud-based IDE with AI agent, instant hosting, and collaborative coding.",
    websiteUrl: "https://replit.com",
    monthlyPrice: 25,
    availableSlots: 4,
    rating: 4.3,
    tags: ["ai", "coding", "cloud-ide"],
    searchKeywords: ["replit", "replit core", "cloud ide"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Replit's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Codeium",
    category: "AI Coding",
    description: "Free-tier-friendly AI coding assistant with a paid Teams tier for advanced features.",
    websiteUrl: "https://codeium.com",
    monthlyPrice: 12,
    availableSlots: 5,
    rating: 4.2,
    tags: ["ai", "coding", "autocomplete"],
    searchKeywords: ["codeium", "ai autocomplete"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Codeium's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Tabnine",
    category: "AI Coding",
    description: "Privacy-focused AI code completion with on-prem and team deployment options.",
    websiteUrl: "https://www.tabnine.com",
    monthlyPrice: 12,
    availableSlots: 5,
    rating: 4.0,
    tags: ["ai", "coding", "autocomplete"],
    searchKeywords: ["tabnine", "ai code completion"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Tabnine's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
];

async function seedCatalog() {
  // The catalog needs an "owner" for each listing. Use the seeded demo host
  // account if present; otherwise fall back to the first ADMIN user found.
  const host =
    (await prisma.user.findUnique({ where: { email: "host@nexseat.app" } })) ??
    (await prisma.user.findFirst({ where: { role: "ADMIN" } }));

  if (!host) {
    throw new Error(
      "No host or admin user found. Run `npm run db:seed` first (creates host@nexseat.app), then re-run this script."
    );
  }

  const allTools = [...AI_ASSISTANTS, ...AI_CODING];
  let created = 0;
  let skipped = 0;

  for (const tool of allTools) {
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

  console.log(`Catalog seed complete: ${created} created, ${skipped} skipped (already existed).`);
}

seedCatalog()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Catalog seed — Productivity tools batch.
 * Run with: npx tsx prisma/seed-catalog-productivity.ts
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

const PRODUCTIVITY: ToolSeed[] = [
  {
    platform: "Notion Plus",
    category: "Productivity",
    description: "All-in-one workspace for notes, docs, wikis, and project tracking.",
    websiteUrl: "https://www.notion.so",
    monthlyPrice: 10,
    availableSlots: 6,
    rating: 4.7,
    isPopular: true,
    tags: ["productivity", "notes", "docs"],
    searchKeywords: ["notion", "notion plus", "workspace app"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Notion's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "ClickUp",
    category: "Productivity",
    description: "Project management platform with tasks, docs, goals, and time tracking in one place.",
    websiteUrl: "https://clickup.com",
    monthlyPrice: 10,
    availableSlots: 5,
    rating: 4.4,
    tags: ["productivity", "project-management"],
    searchKeywords: ["clickup", "project management tool"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with ClickUp's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Monday.com",
    category: "Productivity",
    description: "Visual work OS for managing projects, workflows, and team collaboration.",
    websiteUrl: "https://monday.com",
    monthlyPrice: 12,
    availableSlots: 5,
    rating: 4.3,
    tags: ["productivity", "project-management", "workflows"],
    searchKeywords: ["monday.com", "monday", "work os"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Monday.com's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Trello Premium",
    category: "Productivity",
    description: "Kanban-style task and project management with boards, lists, and automation.",
    websiteUrl: "https://trello.com",
    monthlyPrice: 10,
    availableSlots: 6,
    rating: 4.4,
    tags: ["productivity", "kanban", "task-management"],
    searchKeywords: ["trello", "trello premium", "kanban board"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Trello's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Asana Premium",
    category: "Productivity",
    description: "Work management platform for tracking projects, tasks, and team goals.",
    websiteUrl: "https://asana.com",
    monthlyPrice: 13.49,
    availableSlots: 5,
    rating: 4.3,
    tags: ["productivity", "task-management", "goals"],
    searchKeywords: ["asana", "asana premium", "work management"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Asana's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Slack Pro",
    category: "Productivity",
    description: "Team messaging and collaboration platform with unlimited message history and integrations.",
    websiteUrl: "https://slack.com",
    monthlyPrice: 8.75,
    availableSlots: 6,
    rating: 4.5,
    isPopular: true,
    tags: ["productivity", "communication", "team-chat"],
    searchKeywords: ["slack", "slack pro", "team chat"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Slack's terms.",
    refundPolicy: "Prorated refunds are not provided mid-cycle; unused wallet balance can be withdrawn.",
  },
  {
    platform: "Airtable",
    category: "Productivity",
    description: "Flexible database-spreadsheet hybrid for organizing projects, content, and workflows.",
    websiteUrl: "https://www.airtable.com",
    monthlyPrice: 20,
    availableSlots: 5,
    rating: 4.4,
    tags: ["productivity", "database", "spreadsheet"],
    searchKeywords: ["airtable", "database spreadsheet tool"],
    faqs: [],
    terms: "Members agree to individual, non-commercial use consistent with Airtable's terms.",
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

  for (const tool of PRODUCTIVITY) {
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

  console.log(`Productivity catalog seed complete: ${created} created, ${skipped} skipped (already existed).`);
}

seedCatalog()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

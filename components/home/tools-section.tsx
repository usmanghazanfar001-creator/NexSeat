"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ToolCard, type Tool } from "./tool-card";

// Seed data for the marketing page. In the authenticated app this grid is
// fed by GET /api/subscriptions instead (see app/dashboard).
const TOOLS: Tool[] = [
  { name: "ChatGPT Plus", logo: "chatgpt", monthlyPrice: 20, availableSlots: 5, occupiedSlots: 3 },
  { name: "Claude Pro", logo: "claude", monthlyPrice: 20, availableSlots: 4, occupiedSlots: 4 },
  { name: "Gemini Advanced", logo: "gemini", monthlyPrice: 19.99, availableSlots: 5, occupiedSlots: 2 },
  { name: "Perplexity Pro", logo: "perplexity", monthlyPrice: 20, availableSlots: 6, occupiedSlots: 1 },
  { name: "Midjourney", logo: "midjourney", monthlyPrice: 30, availableSlots: 4, occupiedSlots: 3 },
  { name: "Cursor Pro", logo: "cursor", monthlyPrice: 20, availableSlots: 5, occupiedSlots: 0 },
  { name: "GitHub Copilot", logo: "copilot", monthlyPrice: 10, availableSlots: 5, occupiedSlots: 4 },
  { name: "Canva Pro", logo: "canva", monthlyPrice: 12.99, availableSlots: 5, occupiedSlots: 2 },
  { name: "Notion AI", logo: "notion", monthlyPrice: 10, availableSlots: 5, occupiedSlots: 1 },
];

type SortKey = "popular" | "price_asc" | "price_desc";

export function ToolsSection() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");

  const filtered = useMemo(() => {
    let list = TOOLS.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));
    if (sort === "price_asc") list = [...list].sort((a, b) => a.monthlyPrice - b.monthlyPrice);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.monthlyPrice - a.monthlyPrice);
    if (sort === "popular") list = [...list].sort((a, b) => b.occupiedSlots - a.occupiedSlots);
    return list;
  }, [query, sort]);

  return (
    <section id="tools" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Popular AI tools</h2>
          <p className="mt-2 text-muted-foreground">Open groups you can join today.</p>
        </div>
        <div className="flex w-full gap-3 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools..."
              className="h-10 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="popular">Most popular</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tool, i) => (
          <ToolCard key={tool.name} tool={tool} index={i} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            No tools match &ldquo;{query}&rdquo;. Try another search.
          </p>
        )}
      </div>
    </section>
  );
}

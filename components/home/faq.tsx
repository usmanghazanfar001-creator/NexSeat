"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Is sharing an AI subscription seat against the provider's rules?",
    a: "It depends entirely on the provider. Some plans (like certain Team or Family tiers) are explicitly built for multiple seats and allow this. Others prohibit sharing a single individual login. NexSeat requires hosts to confirm the plan they're listing permits shared seats, and we periodically remove listings that don't comply.",
  },
  {
    q: "What happens if a group falls short a member?",
    a: "The host keeps the empty seat's cost, or NexSeat's autopilot fills it from a waitlist of interested members if the host opts in.",
  },
  {
    q: "How do refunds work if I leave mid-cycle?",
    a: "You keep access until the current billing cycle ends; unused wallet balance is refundable, and pending gateway charges follow the processor's own refund window.",
  },
  {
    q: "Can I run a group for a tool that isn't listed yet?",
    a: "Yes — from your dashboard you can propose a new platform. Our team reviews the provider's terms before it goes live.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <h2 className="mb-10 text-center font-display text-3xl font-bold sm:text-4xl">Questions, answered</h2>
      <div className="divide-y divide-border/60 rounded-2xl border border-border/60">
        {faqs.map((item, i) => (
          <div key={item.q} className="p-5">
            <button
              className="flex w-full items-center justify-between text-left font-medium"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              {item.q}
              <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", openIndex === i && "rotate-180")} />
            </button>
            {openIndex === i && <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

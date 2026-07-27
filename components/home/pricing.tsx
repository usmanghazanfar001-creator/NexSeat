import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Member",
    price: "Free",
    tagline: "Join groups other people host",
    features: ["Browse unlimited groups", "Wallet + card payments", "Renewal reminders", "In-app group chat"],
  },
  {
    name: "Host",
    price: "5%",
    tagline: "Platform fee on seats you fill",
    features: ["List your subscription", "Automatic seat billing", "Payout to bank or wallet", "Member screening"],
    highlighted: true,
  },
  {
    name: "Business",
    price: "Custom",
    tagline: "For teams managing many tools",
    features: ["Bulk group management", "Centralized invoicing", "Priority support", "Dedicated account manager"],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mx-auto mb-14 max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Simple, transparent pricing</h2>
        <p className="mt-3 text-muted-foreground">No hidden markups — you see exactly what each seat costs before you join.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={cn("flex flex-col", plan.highlighted && "border-violet-500/50 ring-1 ring-violet-500/30")}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="font-display text-3xl font-bold">{plan.price}</p>
              <p className="text-sm text-muted-foreground">{plan.tagline}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between gap-6">
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-teal-400" /> {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.highlighted ? "default" : "outline"} className="w-full">
                Get started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

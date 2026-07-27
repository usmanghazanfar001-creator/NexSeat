import { Card, CardContent } from "@/components/ui/card";

const quotes = [
  { name: "Priya N.", role: "Freelance designer", text: "Splitting Claude Pro five ways knocked my tool spend down to something I don't think twice about." },
  { name: "Marcus O.", role: "Indie hacker", text: "Hosting a Cursor Pro group covers my own seat for free — the dashboard makes renewals a non-event." },
  { name: "Ines A.", role: "Grad student", text: "I was priced out of Perplexity Pro alone. A group seat made it worth it for a semester of research." },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <h2 className="mb-10 text-center font-display text-3xl font-bold sm:text-4xl">Trusted by early members</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {quotes.map((q) => (
          <Card key={q.name}>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{q.text}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold">{q.name}</p>
              <p className="text-xs text-muted-foreground">{q.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

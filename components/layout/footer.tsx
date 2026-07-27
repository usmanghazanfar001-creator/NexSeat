import Link from "next/link";

const columns = [
  { title: "Product", links: [["Browse tools", "#tools"], ["Pricing", "#pricing"], ["FAQ", "#faq"]] },
  { title: "Company", links: [["About", "/about"], ["Careers", "/careers"], ["Blog", "/blog"]] },
  { title: "Legal", links: [["Terms", "/terms"], ["Privacy", "/privacy"], ["Acceptable use", "/acceptable-use"]] },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg font-bold">
            Nex<span className="text-gradient">Seat</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Pool AI subscription seats with people you trust. We only list plans whose provider allows shared seats.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-display text-sm font-semibold">{col.title}</p>
            <ul className="mt-4 space-y-2">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} NexSeat. Not affiliated with OpenAI, Anthropic, Google, or any listed provider.
      </div>
    </footer>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlotGauge } from "@/components/home/slot-gauge";
import { formatCurrency, formatDate, computeSeatPrice } from "@/lib/utils";
import { Star } from "lucide-react";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true, avatar: true, createdAt: true } },
      members: { include: { user: { select: { name: true, avatar: true } } }, where: { active: true } },
      reviews: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!subscription) notFound();

  const seatPrice = computeSeatPrice(Number(subscription.monthlyPrice), subscription.availableSlots);
  const isFull = subscription.occupiedSlots >= subscription.availableSlots;
  const avgRating =
    subscription.reviews.length > 0
      ? (subscription.reviews.reduce((s, r) => s + r.rating, 0) / subscription.reviews.length).toFixed(1)
      : null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h1 className="font-display text-3xl font-bold">{subscription.platform}</h1>
              <p className="mt-1 text-muted-foreground">Hosted by {subscription.owner.name}</p>
              {avgRating && (
                <p className="mt-2 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> {avgRating} · {subscription.reviews.length} reviews
                </p>
              )}
            </div>

            {subscription.description && <p className="text-sm leading-relaxed text-foreground/90">{subscription.description}</p>}

            <Card>
              <CardHeader><CardTitle>Reviews</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {subscription.reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
                {subscription.reviews.map((r) => (
                  <div key={r.id} className="border-b border-border/60 pb-4 last:border-0">
                    <p className="text-sm font-medium">{r.user.name} · {r.rating}★</p>
                    {r.comment && <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <p className="font-display text-3xl font-bold">
                  {formatCurrency(seatPrice)}<span className="text-sm font-normal text-muted-foreground">/mo per seat</span>
                </p>
                <SlotGauge total={subscription.availableSlots} occupied={subscription.occupiedSlots} />
                <p className="text-xs text-muted-foreground">Renews {formatDate(subscription.renewalDate)}</p>
                <Button className="w-full" disabled={isFull} variant={isFull ? "secondary" : "default"}>
                  {isFull ? "Group full" : "Join group"}
                </Button>
                <Button variant="outline" className="w-full">Message host</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Members ({subscription.members.length})</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {subscription.members.map((m) => (
                  <span key={m.id} className="rounded-full bg-secondary px-3 py-1 text-xs">{m.user.name}</span>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

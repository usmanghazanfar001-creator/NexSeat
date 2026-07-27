"use client";

import { cn } from "@/lib/utils";

/**
 * SlotGauge — NexSeat's signature visual element.
 *
 * Every tool card, group page, and dashboard stat reuses this segmented
 * meter: each segment is one seat on the subscription, filled with the
 * violet -> teal gradient as seats are claimed. It makes the core idea of
 * the product (a subscription divided into shared seats) legible at a
 * glance, instead of just showing "3/5" as plain text.
 */
export function SlotGauge({
  total,
  occupied,
  className,
}: {
  total: number;
  occupied: number;
  className?: string;
}) {
  const segments = Array.from({ length: total });

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex flex-1 gap-1">
        {segments.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors duration-500",
              i < occupied ? "bg-meter-gradient" : "bg-muted"
            )}
            style={i < occupied ? { animationDelay: `${i * 80}ms` } : undefined}
          />
        ))}
      </div>
      <span className="shrink-0 font-display text-xs font-semibold text-muted-foreground">
        {occupied}/{total} seats
      </span>
    </div>
  );
}

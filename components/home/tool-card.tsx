"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SlotGauge } from "./slot-gauge";
import { formatCurrency } from "@/lib/utils";

export type Tool = {
  name: string;
  logo: string;
  monthlyPrice: number;
  availableSlots: number;
  occupiedSlots: number;
};

export function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const seatPrice = tool.monthlyPrice / tool.availableSlots;
  const isFull = tool.occupiedSlots >= tool.availableSlots;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Card className="group h-full transition-transform duration-300 hover:-translate-y-1">
        <CardHeader className="flex-row items-center gap-3 space-y-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-lg font-display font-bold">
            {tool.name.charAt(0)}
          </div>
          <div>
            <p className="font-display font-semibold leading-tight">{tool.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(seatPrice)}/mo per seat
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SlotGauge total={tool.availableSlots} occupied={tool.occupiedSlots} />
          <Button className="w-full" size="sm" disabled={isFull} variant={isFull ? "secondary" : "default"}>
            {isFull ? "Group full" : "Join group"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SlotGauge } from "./slot-gauge";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero-glow px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-xs text-muted-foreground"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
          Only plans whose ToS permits shared seats
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl"
        >
          One subscription. <span className="text-gradient">Split five ways.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-balance text-lg text-muted-foreground"
        >
          Open a group for ChatGPT Plus, Claude Pro, or any seat-based AI plan. We handle the split, the
          renewal reminders, and the payments — you just pick a seat.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Find a group <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register?intent=host">
            <Button size="lg" variant="outline">
              Host a subscription
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-14 max-w-sm rounded-2xl glass glow-ring p-5 text-left"
        >
          <p className="mb-3 text-xs font-medium text-muted-foreground">ChatGPT Plus · Team of 5</p>
          <SlotGauge total={5} occupied={3} />
          <p className="mt-3 text-xs text-muted-foreground">$4.80/seat · renews in 12 days</p>
        </motion.div>
      </div>
    </section>
  );
}

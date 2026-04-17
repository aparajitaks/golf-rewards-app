"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Heart, LineChart, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Charity } from "@/lib/types";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.28),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(167,139,250,0.18),transparent)]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-violet-500" />
            Stableford draws · charity-directed impact
          </div>
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Rewards that feel{" "}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-300 dark:to-fuchsia-300">
              intentional
            </span>
            , not inherited.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
            Subscribe, log your last five Stableford rounds, and join a monthly draw engineered for fairness — while
            directing at least 10% to a charity you believe in.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="min-w-[200px] gap-2 shadow-lg shadow-violet-500/20">
              <Link href="/signup">
                Start membership <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/concept">See how it works</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    { title: "Subscribe", body: "Choose monthly or annual billing. Stripe handles secure renewals.", icon: LineChart },
    { title: "Log five scores", body: "Stableford points (1–45) with dates. We keep only your latest five.", icon: Trophy },
    { title: "Enter the draw", body: "Your ticket snapshots your line-up for that month’s published numbers.", icon: Sparkles },
    { title: "Give & grow", body: "Pick a partner charity and scale your contribution from 10% upward.", icon: Heart },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">How membership works</h2>
        <p className="mt-3 text-muted-foreground">No plaid. No faux fairway hero shots. Just a crisp loop you can explain in one sentence.</p>
      </motion.div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div key={s.title} {...fadeUp} transition={{ delay: i * 0.06, duration: 0.45 }}>
            <Card className="h-full border-border/70 bg-card/60">
              <CardContent className="p-6">
                <s.icon className="size-8 text-violet-500" />
                <h3 className="mt-4 font-heading text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function PrizePoolSection() {
  return (
    <section className="border-y border-border/60 bg-muted/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div {...fadeUp} className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Prize pool architecture</h2>
            <p className="mt-4 text-muted-foreground">
              Each month we allocate the pool across three match tiers. Five-of-five shares the headline tier; ties split
              evenly. Unclaimed headline allocation rolls forward as a transparent jackpot.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex justify-between rounded-lg border border-border/60 bg-card/80 px-4 py-3">
                <span className="font-medium">5 matches</span>
                <span className="text-muted-foreground">40% · jackpot rollover if empty</span>
              </li>
              <li className="flex justify-between rounded-lg border border-border/60 bg-card/80 px-4 py-3">
                <span className="font-medium">4 matches</span>
                <span className="text-muted-foreground">35%</span>
              </li>
              <li className="flex justify-between rounded-lg border border-border/60 bg-card/80 px-4 py-3">
                <span className="font-medium">3 matches</span>
                <span className="text-muted-foreground">25%</span>
              </li>
            </ul>
          </div>
          <motion.div {...fadeUp} className="rounded-2xl border border-border/70 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-8">
            <p className="text-sm font-medium uppercase tracking-wider text-violet-600 dark:text-violet-300">Draw modes</p>
            <p className="mt-3 text-lg font-semibold">Random lottery or weighted rarity</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Admins can simulate either engine before publishing official results — so the community sees the same numbers
              you tested.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function FeaturedCharitiesSection({ charities }: { charities: Pick<Charity, "id" | "name" | "slug" | "short_description">[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <motion.div {...fadeUp} className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">Featured partners</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">Browse the full directory, search by cause, and change your allocation anytime.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/charities">Browse charities</Link>
        </Button>
      </motion.div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {charities.map((c, i) => (
          <motion.div key={c.id} {...fadeUp} transition={{ delay: i * 0.08 }}>
            <Link href={`/charities/${c.slug}`}>
              <Card className="h-full transition hover:border-violet-500/40 hover:shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold">{c.name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.short_description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-300">
                    View profile <ArrowRight className="size-3.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
        {charities.length === 0 && (
          <p className="text-sm text-muted-foreground">Run the Supabase seed script to load featured charities.</p>
        )}
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const quotes = [
    { name: "Amina K.", role: "Product lead, London", text: "Finally a golf-adjacent product that doesn’t look like a 2007 forum skin." },
    { name: "Jonah P.", role: "CFO, Manchester", text: "We wanted fintech-grade clarity on where money flows — this nails it." },
    { name: "Sofia R.", role: "Coach, Edinburgh", text: "My players understood the draw rules in one read. That’s rare." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <motion.h2 {...fadeUp} className="font-heading text-center text-3xl font-bold">
        What members say
      </motion.h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {quotes.map((q, i) => (
          <motion.div key={q.name} {...fadeUp} transition={{ delay: i * 0.08 }}>
            <Card className="h-full bg-card/70">
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">“{q.text}”</p>
                <p className="mt-4 text-sm font-semibold">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.role}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function FaqSection() {
  const faqs = [
    { q: "Why only five scores?", a: "Keeps the draw legible and prevents long-tail gaming. New rounds automatically retire the oldest entry." },
    { q: "Can I change charity?", a: "Yes — update your profile anytime. Minimum 10% contribution is enforced at signup and beyond." },
    { q: "What if my subscription lapses?", a: "Score entry, draw joins, and premium dashboard tiles lock until billing is healthy again." },
  ];
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <motion.h2 {...fadeUp} className="font-heading text-center text-3xl font-bold">
        FAQ
      </motion.h2>
      <div className="mt-8 space-y-4">
        {faqs.map((f, i) => (
          <motion.details
            key={f.q}
            {...fadeUp}
            transition={{ delay: i * 0.05 }}
            className="group rounded-xl border border-border/70 bg-card/60 px-5 py-4"
          >
            <summary className="cursor-pointer font-medium">{f.q}</summary>
            <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
          </motion.details>
        ))}
      </div>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="border-t border-border/60 bg-gradient-to-br from-violet-600/90 to-fuchsia-600/90 py-20 text-primary-foreground">
      <motion.div {...fadeUp} className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">Ready when you are</h2>
        <p className="mt-4 text-primary-foreground/90">Join the draw, pick your charity, and keep your game data in one calm dashboard.</p>
        <Button size="lg" variant="secondary" className="mt-8 gap-2" asChild>
          <Link href="/pricing">
            View plans <ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}

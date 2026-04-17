import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "How it works",
  description: "Stableford draws, charity impact, and membership mechanics for Golf Rewards Charity.",
};

export default function ConceptPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wider text-violet-600 dark:text-violet-300">Concept</p>
      <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight">Designed like a product, not a poster</h1>
      <p className="mt-4 text-muted-foreground">
        Golf Rewards Charity is a subscription platform. Members maintain five Stableford scores, join a transparent monthly
        draw, and route a meaningful slice of membership value to charities they choose.
      </p>

      <div className="mt-10 space-y-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-semibold">Stableford guardrails</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Points between 1 and 45 with a date per round. Duplicated dates are blocked. We always display your ticket in
              reverse chronological order so the draw snapshot matches what you see.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-semibold">Membership gates</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If Stripe reports an inactive subscription, score entry, draw joins, and premium analytics tiles are disabled
              until billing returns to good standing.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-heading text-lg font-semibold">Winner verification</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Matched members upload screenshot proof. Admins approve or reject, then mark payouts complete when funds leave
              the house account.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/signup">Create account</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/pricing">View pricing</Link>
        </Button>
      </div>
    </div>
  );
}

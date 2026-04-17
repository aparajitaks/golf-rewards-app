import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Monthly or annual membership for Golf Rewards Charity.",
};

export default function PricingPage() {
  const monthly = process.env.STRIPE_PRICE_MONTHLY ?? "";
  const yearly = process.env.STRIPE_PRICE_YEARLY ?? "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight">Membership</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Stripe subscriptions with a self-serve billing portal. Annual includes a meaningful discount — configure exact
          amounts in your Stripe dashboard.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Monthly</CardTitle>
            <p className="text-sm text-muted-foreground">Flexible — perfect if you want to trial the full stack first.</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">£19</div>
            <p className="mt-1 text-xs text-muted-foreground">Illustrative — replace with your live Stripe price.</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Full draw eligibility</li>
              <li>• Score manager & charity controls</li>
              <li>• Dashboard notifications</li>
            </ul>
          </CardContent>
          <CardFooter>
            <CheckoutButton priceId={monthly} label="Subscribe monthly" />
          </CardFooter>
        </Card>

        <Card className="border-violet-500/40 shadow-lg shadow-violet-500/10">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="font-heading text-2xl">Yearly</CardTitle>
              <Badge>Best value</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Two months free equivalent when you commit for the season.</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">£190</div>
            <p className="mt-1 text-xs text-muted-foreground">Illustrative — wire your yearly Stripe price ID.</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Everything in monthly</li>
              <li>• Priority feature previews</li>
              <li>• Annual charity impact statement</li>
            </ul>
          </CardContent>
          <CardFooter>
            <CheckoutButton priceId={yearly} label="Subscribe yearly" />
          </CardFooter>
        </Card>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Already a member?{" "}
        <Link href="/dashboard/subscription" className="font-medium text-foreground underline-offset-4 hover:underline">
          Manage billing
        </Link>
      </p>
    </div>
  );
}

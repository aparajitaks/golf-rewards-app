import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { isPremiumActive } from "@/lib/subscription";
import type { SubscriptionRow } from "@/lib/types";
import { BillingPortalButton } from "@/components/billing-portal-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SubscriptionPage() {
  const { user } = await requireUser();
  const supabase = await createServerSupabase();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const active = isPremiumActive(sub as SubscriptionRow | null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Subscription & billing</h1>
        <p className="mt-2 text-muted-foreground">Stripe powers renewals, invoices, and the customer portal.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-lg">Status</CardTitle>
          <Badge variant={active ? "success" : "secondary"}>{active ? "Active" : "Inactive"}</Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {sub?.plan_interval && (
            <p>
              Plan interval: <span className="font-medium capitalize">{sub.plan_interval}</span>
            </p>
          )}
          {sub?.current_period_end && (
            <p className="text-muted-foreground">
              Current period ends{" "}
              <span className="font-medium text-foreground">
                {new Date(sub.current_period_end).toLocaleString(undefined, { dateStyle: "medium" })}
              </span>
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <BillingPortalButton />
            <Button asChild variant="secondary">
              <Link href="/pricing">Change plan</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { isPremiumActive } from "@/lib/subscription";
import type { SubscriptionRow } from "@/lib/types";
import { DrawEntryButtons } from "@/components/draw-entry-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DrawsPage() {
  const { user } = await requireUser();
  const supabase = await createServerSupabase();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const premium = isPremiumActive(sub as SubscriptionRow | null);

  const { count } = await supabase
    .from("scores")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const scoreCount = count ?? 0;
  const canEnter = premium && scoreCount >= 5;

  const { data: draws } = await supabase
    .from("draws")
    .select("id, title, status, period_month, closes_at")
    .in("status", ["open", "closed", "published"])
    .order("period_month", { ascending: false });

  const drawIds = (draws ?? []).map((d) => d.id);
  const { data: myEntries } =
    drawIds.length > 0
      ? await supabase.from("draw_entries").select("draw_id").eq("user_id", user.id).in("draw_id", drawIds)
      : { data: [] as { draw_id: string }[] };

  const enteredSet = new Set((myEntries ?? []).map((e) => e.draw_id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Draws</h1>
        <p className="mt-2 text-muted-foreground">
          Enter while a draw is open. We snapshot your latest five Stableford scores as your ticket for that month.
        </p>
        {!premium && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">Subscription required to enter.</p>}
        {premium && scoreCount < 5 && (
          <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">Add five scores to unlock draw entry.</p>
        )}
      </div>

      <div className="grid gap-4">
        {(draws ?? []).map((d) => (
          <Card key={d.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="font-heading text-lg">{d.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground capitalize">{d.status}</p>
              </div>
              <DrawEntryButtons drawId={d.id} status={d.status} entered={enteredSet.has(d.id)} canEnter={canEnter} />
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Period {d.period_month}
              {d.closes_at && <> · Closes {new Date(d.closes_at).toLocaleString()}</>}
            </CardContent>
          </Card>
        ))}
        {(draws ?? []).length === 0 && <p className="text-sm text-muted-foreground">No draws scheduled yet.</p>}
      </div>
    </div>
  );
}

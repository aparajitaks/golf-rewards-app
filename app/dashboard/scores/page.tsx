import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { isPremiumActive } from "@/lib/subscription";
import type { SubscriptionRow } from "@/lib/types";
import { ScoreForm } from "@/components/score-form";
import { ScoreList } from "@/components/score-list";

export default async function ScoresPage() {
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

  const { data: scores } = await supabase
    .from("scores")
    .select("id, score_date, points")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Score manager</h1>
        <p className="mt-2 text-muted-foreground">
          We keep your latest five Stableford scores (1–45) with unique dates. New entries automatically retire the oldest
          round.
        </p>
      </div>
      <ScoreForm disabled={!premium} />
      {!premium && (
        <p className="text-sm text-amber-600 dark:text-amber-400">Activate your subscription to add or edit scores.</p>
      )}
      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold">Your ticket line-up</h2>
        <ScoreList scores={scores ?? []} disabled={!premium} />
      </div>
    </div>
  );
}

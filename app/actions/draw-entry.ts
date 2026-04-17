"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { isPremiumActive } from "@/lib/subscription";
import type { SubscriptionRow } from "@/lib/types";
import { assertRateLimit } from "@/lib/rate-limit";

export async function enterDrawAction(drawId: string) {
  const { user } = await requireUser();
  const supabase = await createServerSupabase();
  const rl = await assertRateLimit(`draw:${drawId}:${user.id}`, 5, 86_400_000);
  if (!rl.ok) {
    return { ok: false as const, error: "Rate limited" };
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!isPremiumActive(sub as SubscriptionRow | null)) {
    return { ok: false as const, error: "Active subscription required to enter draws." };
  }

  const { data: draw } = await supabase.from("draws").select("*").eq("id", drawId).maybeSingle();
  if (!draw || draw.status !== "open") {
    return { ok: false as const, error: "This draw is not open for entries." };
  }

  const { data: scores } = await supabase
    .from("scores")
    .select("points, score_date")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false })
    .limit(5);

  if (!scores || scores.length < 5) {
    return { ok: false as const, error: "You need five Stableford scores on file to enter." };
  }

  const snapshot = scores.map((s) => s.points);
  const { error } = await supabase.from("draw_entries").upsert(
    {
      draw_id: drawId,
      user_id: user.id,
      scores_snapshot: snapshot,
    },
    { onConflict: "draw_id,user_id" },
  );

  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/draws");
  return { ok: true as const };
}

export async function leaveDrawAction(drawId: string) {
  const { user } = await requireUser();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("draw_entries").delete().eq("draw_id", drawId).eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/draws");
  return { ok: true as const };
}

"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { scoreFormSchema } from "@/lib/schemas/score";
import { isPremiumActive } from "@/lib/subscription";
import type { SubscriptionRow } from "@/lib/types";
import { assertRateLimit } from "@/lib/rate-limit";

async function requirePremium() {
  const { user } = await requireUser();
  const supabase = await createServerSupabase();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!isPremiumActive(sub as SubscriptionRow | null)) {
    throw new Error("Active subscription required to manage scores.");
  }
  return { user, supabase };
}

export async function upsertScoreAction(input: unknown) {
  const parsed = scoreFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const { user, supabase } = await requirePremium();
  const rl = await assertRateLimit(`scores:${user.id}`, 40, 60_000);
  if (!rl.ok) {
    return { ok: false as const, error: { _form: ["Too many requests. Try again shortly."] } };
  }

  const { score_date, points } = parsed.data;

  const { data: existingRows } = await supabase
    .from("scores")
    .select("id, score_date")
    .eq("user_id", user.id)
    .order("score_date", { ascending: true });

  const rows = existingRows ?? [];
  const sameDate = rows.find((r) => r.score_date === score_date);

  if (sameDate) {
    const { error } = await supabase.from("scores").update({ points }).eq("id", sameDate.id);
    if (error) return { ok: false as const, error: { _form: [error.message] } };
  } else {
    const otherDateConflict = rows.some((r) => r.score_date === score_date);
    if (otherDateConflict) {
      return { ok: false as const, error: { score_date: ["Duplicate date."] } };
    }
    if (rows.length >= 5) {
      const oldest = rows[0];
      if (oldest) await supabase.from("scores").delete().eq("id", oldest.id);
    }
    const { error } = await supabase.from("scores").insert({
      user_id: user.id,
      score_date,
      points,
    });
    if (error) return { ok: false as const, error: { _form: [error.message] } };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/scores");
  return { ok: true as const };
}

export async function deleteScoreAction(id: string) {
  const { user, supabase } = await requirePremium();
  const { error } = await supabase.from("scores").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/scores");
  return { ok: true as const };
}

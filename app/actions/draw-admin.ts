"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-admin";
import {
  allocatePrizes,
  matchCount,
  randomWinningScores,
  tierFromMatches,
  weightedWinningScores,
} from "@/lib/draw-engine";
import { logAdminAction } from "@/lib/admin-log";
import { sendEmail, EmailTemplates } from "@/lib/email";

type EntryRow = { user_id: string; scores_snapshot: number[]; id: string };

function buildSimulation(entries: EntryRow[], winningScores: number[], poolCents: number, jackpotCarryIn: number) {
  const matches = entries.map((e) => ({
    user_id: e.user_id,
    entry_id: e.id,
    match_count: matchCount(e.scores_snapshot, winningScores),
  }));

  const counts = {
    five: matches.filter((m) => m.match_count >= 5).length,
    four: matches.filter((m) => m.match_count === 4).length,
    three: matches.filter((m) => m.match_count === 3).length,
  };

  const { allocations, jackpotCarryOut } = allocatePrizes(poolCents, jackpotCarryIn, counts);
  const fiveA = allocations.find((a) => a.tier === "five")!;
  const fourA = allocations.find((a) => a.tier === "four")!;
  const threeA = allocations.find((a) => a.tier === "three")!;

  const preview = matches.map((m) => {
    const tier = tierFromMatches(m.match_count);
    const cents =
      tier === "five"
        ? fiveA.perWinnerCents
        : tier === "four"
          ? fourA.perWinnerCents
          : tier === "three"
            ? threeA.perWinnerCents
            : 0;
    return {
      user_id: m.user_id,
      entry_id: m.entry_id,
      match_count: m.match_count,
      prize_tier: tier,
      prize_cents: cents,
    };
  });

  return { winning_scores: winningScores, preview, jackpot_carry_out: jackpotCarryOut, counts };
}

export async function simulateDrawAction(drawId: string) {
  const { user } = await requireAdmin();
  const supabase = await createServerSupabase();

  const { data: draw } = await supabase.from("draws").select("*").eq("id", drawId).maybeSingle();
  if (!draw) return { ok: false as const, error: "Draw not found" };

  const { data: entries } = await supabase.from("draw_entries").select("id, user_id, scores_snapshot").eq("draw_id", drawId);
  const list = (entries ?? []) as EntryRow[];
  const snaps = list.map((e) => e.scores_snapshot);
  const winning =
    draw.mode === "weighted" && snaps.length > 0 ? weightedWinningScores(snaps) : randomWinningScores();

  const sim = buildSimulation(list, winning, draw.pool_cents ?? 0, draw.jackpot_carry_in_cents ?? 0);

  const { error } = await supabase
    .from("draws")
    .update({
      status: "simulated",
      simulation_result: sim as unknown as Record<string, unknown>,
    })
    .eq("id", drawId);

  if (error) return { ok: false as const, error: error.message };
  await logAdminAction(supabase, user.id, "draw.simulate", { type: "draw", id: drawId }, { counts: sim.counts });
  revalidatePath("/admin/draws");
  return { ok: true as const, simulation: sim };
}

export async function publishDrawAction(drawId: string) {
  const { user } = await requireAdmin();
  const supabase = await createServerSupabase();

  const { data: draw } = await supabase.from("draws").select("*").eq("id", drawId).maybeSingle();
  if (!draw) return { ok: false as const, error: "Draw not found" };

  const { data: entries } = await supabase.from("draw_entries").select("id, user_id, scores_snapshot").eq("draw_id", drawId);
  const list = (entries ?? []) as EntryRow[];

  const sim = draw.simulation_result as { winning_scores?: number[] } | null;
  let winning: number[];
  if (Array.isArray(sim?.winning_scores) && sim.winning_scores.length === 5) {
    winning = sim.winning_scores as number[];
  } else {
    const snaps = list.map((e) => e.scores_snapshot);
    winning =
      draw.mode === "weighted" && snaps.length > 0 ? weightedWinningScores(snaps) : randomWinningScores();
  }

  const built = buildSimulation(list, winning, draw.pool_cents ?? 0, draw.jackpot_carry_in_cents ?? 0);

  await supabase.from("winners").delete().eq("draw_id", drawId);
  await supabase.from("draw_results").delete().eq("draw_id", drawId);

  const resultRows = built.preview.map((p) => ({
    draw_id: drawId,
    user_id: p.user_id,
    entry_id: p.entry_id,
    match_count: p.match_count,
    prize_tier: p.prize_tier,
    prize_cents: p.prize_cents,
    verification_status: p.prize_cents > 0 ? "pending" : "na",
    payout_status: p.prize_cents > 0 ? "pending" : "na",
  }));

  const { data: inserted, error: insErr } = await supabase.from("draw_results").insert(resultRows).select("id, user_id, prize_tier, prize_cents");
  if (insErr) return { ok: false as const, error: insErr.message };

  const winnerInserts =
    inserted
      ?.filter((r) => (r.prize_cents ?? 0) > 0 && r.prize_tier !== "none")
      .map((r) => ({
        draw_result_id: r.id,
        draw_id: drawId,
        user_id: r.user_id,
        prize_tier: r.prize_tier,
        prize_cents: r.prize_cents ?? 0,
        verification_status: "pending" as const,
        payout_status: "pending" as const,
      })) ?? [];

  if (winnerInserts.length > 0) {
    const { error: wErr } = await supabase.from("winners").insert(winnerInserts);
    if (wErr) return { ok: false as const, error: wErr.message };
  }

  for (const row of built.preview) {
    if (row.prize_cents <= 0) continue;
    await supabase.from("notifications").insert({
      user_id: row.user_id,
      type: "winner",
      title: "You matched this month",
      body: "Upload your winner proof from the dashboard to verify your prize.",
      metadata: { draw_id: drawId },
    });
    const { data: prof } = await supabase.from("profiles").select("email, full_name").eq("id", row.user_id).maybeSingle();
    if (prof?.email) {
      const amt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(row.prize_cents / 100);
      await sendEmail({ to: prof.email, ...EmailTemplates.winnerAlert(prof.full_name ?? "there", amt) });
    }
  }

  const { error: dErr } = await supabase
    .from("draws")
    .update({
      status: "published",
      winning_scores: winning,
      jackpot_carry_out_cents: built.jackpot_carry_out,
      published_at: new Date().toISOString(),
      simulation_result: built as unknown as Record<string, unknown>,
    })
    .eq("id", drawId);

  if (dErr) return { ok: false as const, error: dErr.message };

  await logAdminAction(supabase, user.id, "draw.publish", { type: "draw", id: drawId }, { entries: list.length });
  revalidatePath("/admin/draws");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function upsertDrawAction(payload: {
  id?: string;
  title: string;
  period_month: string;
  mode: "random" | "weighted";
  pool_cents: number;
  jackpot_carry_in_cents: number;
  status: string;
}) {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const row = {
    title: payload.title,
    period_month: payload.period_month,
    mode: payload.mode,
    pool_cents: payload.pool_cents,
    jackpot_carry_in_cents: payload.jackpot_carry_in_cents,
    status: payload.status,
  };
  if (payload.id) {
    const { error } = await supabase.from("draws").update(row).eq("id", payload.id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await supabase.from("draws").insert(row);
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath("/admin/draws");
  return { ok: true as const };
}

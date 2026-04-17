"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-admin";
import { logAdminAction } from "@/lib/admin-log";
import { sendEmail, EmailTemplates } from "@/lib/email";

export async function verifyWinnerProofAction(winnerId: string, decision: "approved" | "rejected") {
  const { user } = await requireAdmin();
  const supabase = await createServerSupabase();

  const { data: w } = await supabase.from("winners").select("*").eq("id", winnerId).maybeSingle();
  if (!w) return { ok: false as const, error: "Winner not found" };

  const { error } = await supabase
    .from("winners")
    .update({ verification_status: decision })
    .eq("id", winnerId);
  if (error) return { ok: false as const, error: error.message };

  await supabase
    .from("draw_results")
    .update({ verification_status: decision })
    .eq("draw_id", w.draw_id)
    .eq("user_id", w.user_id);

  if (decision === "approved") {
    const { data: prof } = await supabase.from("profiles").select("email, full_name").eq("id", w.user_id).maybeSingle();
    if (prof?.email) {
      await sendEmail({ to: prof.email, ...EmailTemplates.proofApproved(prof.full_name ?? "there") });
    }
  }

  await logAdminAction(supabase, user.id, "winner.verify", { type: "winner", id: winnerId }, { decision });
  revalidatePath("/admin/winners");
  revalidatePath("/dashboard/winnings");
  return { ok: true as const };
}

export async function markWinnerPaidAction(winnerId: string) {
  const { user } = await requireAdmin();
  const supabase = await createServerSupabase();
  const { data: w } = await supabase.from("winners").select("*").eq("id", winnerId).maybeSingle();
  if (!w) return { ok: false as const, error: "Winner not found" };

  const { error } = await supabase
    .from("winners")
    .update({ payout_status: "paid" })
    .eq("id", winnerId);
  if (error) return { ok: false as const, error: error.message };

  await supabase
    .from("draw_results")
    .update({ payout_status: "paid" })
    .eq("draw_id", w.draw_id)
    .eq("user_id", w.user_id);

  await logAdminAction(supabase, user.id, "winner.paid", { type: "winner", id: winnerId }, {});
  revalidatePath("/admin/winners");
  return { ok: true as const };
}

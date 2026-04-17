"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

/** After uploading to storage from client, register the path on the winner row. */
export async function attachWinnerProofAction(winnerId: string, storagePath: string) {
  const { user } = await requireUser();
  const supabase = await createServerSupabase();
  const { data: w } = await supabase.from("winners").select("id, user_id").eq("id", winnerId).maybeSingle();
  if (!w || w.user_id !== user.id) {
    return { ok: false as const, error: "Not found" };
  }
  const { error } = await supabase
    .from("winners")
    .update({ proof_storage_path: storagePath, verification_status: "pending" })
    .eq("id", winnerId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/winnings");
  return { ok: true as const };
}

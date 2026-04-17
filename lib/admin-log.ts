import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAdminAction(
  supabase: SupabaseClient,
  adminId: string,
  action: string,
  entity?: { type: string; id?: string | null },
  payload?: Record<string, unknown>,
) {
  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action,
    entity_type: entity?.type ?? null,
    entity_id: entity?.id && /^[0-9a-f-]{36}$/i.test(entity.id) ? entity.id : null,
    payload: { ...(payload ?? {}), entity_id_raw: entity?.id },
  });
}

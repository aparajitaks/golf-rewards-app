"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

const profileSchema = z.object({
  full_name: z.string().min(1).max(120).optional(),
  charity_id: z
    .union([z.string().uuid(), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  contribution_percent: z.coerce.number().int().min(10).max(100).optional(),
  independent_donation_opt_in: z.boolean().optional(),
});

export async function updateProfileAction(input: unknown) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }
  const { user } = await requireUser();
  const supabase = await createServerSupabase();

  const patch: Record<string, unknown> = {};
  if (parsed.data.full_name !== undefined) patch.full_name = parsed.data.full_name;
  if (parsed.data.charity_id !== undefined) patch.charity_id = parsed.data.charity_id;
  if (parsed.data.contribution_percent !== undefined) patch.contribution_percent = parsed.data.contribution_percent;
  if (parsed.data.independent_donation_opt_in !== undefined) {
    patch.independent_donation_opt_in = parsed.data.independent_donation_opt_in;
  }

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) return { ok: false as const, error: { _form: [error.message] } };
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/charity");
  return { ok: true as const };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-admin";
import { logAdminAction } from "@/lib/admin-log";

const charitySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  short_description: z.string().max(400).optional().nullable(),
  description: z.string().max(8000).optional().nullable(),
  mission: z.string().max(2000).optional().nullable(),
  website_url: z.string().max(500).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  logo_url: z.string().max(800).optional().nullable(),
  cover_image_url: z.string().max(800).optional().nullable(),
});

export async function upsertCharityAction(input: unknown) {
  await requireAdmin();
  const parsed = charitySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  const supabase = await createServerSupabase();
  const { id, tags, ...rest } = parsed.data;
  const row = {
    ...rest,
    website_url: rest.website_url?.trim() || null,
    logo_url: rest.logo_url?.trim() || null,
    cover_image_url: rest.cover_image_url?.trim() || null,
    tags: tags ?? [],
  };

  if (id) {
    const { error } = await supabase.from("charities").update(row).eq("id", id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await supabase.from("charities").insert(row);
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath("/charities");
  revalidatePath("/admin/charities");
  return { ok: true as const };
}

export async function deleteCharityAction(id: string) {
  const { user } = await requireAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("charities").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  await logAdminAction(supabase, user.id, "charity.delete", { type: "charity", id }, {});
  revalidatePath("/charities");
  revalidatePath("/admin/charities");
  return { ok: true as const };
}

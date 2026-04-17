import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { CharityAdminForm } from "@/components/admin/charity-admin-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditCharityPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: c } = await supabase.from("charities").select("*").eq("id", id).maybeSingle();
  if (!c) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Edit charity</h1>
        <p className="mt-2 text-muted-foreground">{c.name}</p>
      </div>
      <CharityAdminForm initial={c} />
    </div>
  );
}

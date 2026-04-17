import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { CharityAdminForm } from "@/components/admin/charity-admin-form";
import { DeleteCharityButton } from "@/components/admin/delete-charity-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteCharityAction } from "@/app/actions/admin-charities";

export default async function AdminCharitiesPage() {
  const supabase = await createServerSupabase();
  const { data: rows } = await supabase.from("charities").select("*").order("name");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-heading text-3xl font-bold">Charities</h1>
        <p className="mt-2 text-muted-foreground">Create new partners, then fine-tune copy on the edit screen.</p>
      </div>

      <CharityAdminForm />

      <div className="grid gap-4">
        {(rows ?? []).map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg font-semibold">{c.name}</h2>
                  {c.featured && <Badge>Featured</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.slug}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/admin/charities/${c.id}`}>Edit</Link>
                </Button>
                <DeleteCharityButton id={c.id} action={deleteCharityAction} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

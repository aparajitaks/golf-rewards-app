import { createServerSupabase } from "@/lib/supabase/server";
import { AdminDrawActions } from "@/components/admin/admin-draw-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminDrawsPage() {
  const supabase = await createServerSupabase();
  const { data: draws } = await supabase.from("draws").select("*").order("period_month", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Draws</h1>
        <p className="mt-2 text-muted-foreground">Simulate to preview numbers and allocation, then publish to lock results.</p>
      </div>
      <div className="grid gap-4">
        {(draws ?? []).map((d) => (
          <Card key={d.id}>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="font-heading text-lg">{d.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.period_month} · {d.mode} · pool £{((d.pool_cents ?? 0) / 100).toFixed(0)}
                </p>
              </div>
              <Badge variant="outline" className="capitalize">
                {d.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                {Array.isArray(d.winning_scores) && d.winning_scores.length === 5 && (
                  <span>Numbers: {d.winning_scores.join(", ")}</span>
                )}
              </div>
              {d.status !== "published" && <AdminDrawActions drawId={d.id} />}
            </CardContent>
          </Card>
        ))}
        {(draws ?? []).length === 0 && <p className="text-sm text-muted-foreground">Create a draw via SQL or future create form.</p>}
      </div>
    </div>
  );
}

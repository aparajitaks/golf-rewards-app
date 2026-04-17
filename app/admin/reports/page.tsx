import { createServerSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminReportsPage() {
  const supabase = await createServerSupabase();

  const [{ count: users }, { count: activeSubs }, { count: charities }, { count: draws }, { count: entries }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "trialing"]),
      supabase.from("charities").select("id", { count: "exact", head: true }),
      supabase.from("draws").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("draw_entries").select("id", { count: "exact", head: true }),
    ]);

  const { data: raised } = await supabase.from("charities").select("total_raised_cents");
  const charityTotal = (raised ?? []).reduce((s, r) => s + (r.total_raised_cents ?? 0), 0);

  const stats = [
    { label: "Total profiles", value: users ?? 0 },
    { label: "Active subscribers", value: activeSubs ?? 0 },
    { label: "Charities live", value: charities ?? 0 },
    { label: "Published draws", value: draws ?? 0 },
    { label: "Total draw entries", value: entries ?? 0 },
    { label: "Charity ledger (cents sum)", value: charityTotal },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Reports</h1>
        <p className="mt-2 text-muted-foreground">High-level operational metrics from Supabase counts.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{s.value}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

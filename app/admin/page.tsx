import { createServerSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminHomePage() {
  const supabase = await createServerSupabase();
  const [{ count: users }, { count: subs }, { count: charities }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "trialing"]),
    supabase.from("charities").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Admin overview</h1>
        <p className="mt-2 text-muted-foreground">Operate draws, verify winners, and curate charity partners.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Profiles</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{users ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Active subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{subs ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Charities</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{charities ?? "—"}</CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/draws">Manage draws</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/winners">Verify winners</Link>
        </Button>
      </div>
    </div>
  );
}

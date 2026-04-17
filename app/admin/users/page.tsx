import { createServerSupabase } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const supabase = await createServerSupabase();
  let query = supabase.from("profiles").select("id, email, full_name, role, created_at").order("created_at", { ascending: false }).limit(50);
  if (q) {
    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  }
  const { data: rows } = await query;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Users</h1>
        <p className="mt-2 text-muted-foreground">Search profiles. Subscription edits happen via Stripe or service scripts.</p>
      </div>
      <form method="get" className="flex max-w-md flex-col gap-2 rounded-xl border border-border/70 bg-card/60 p-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="q">Search</Label>
          <Input id="q" name="q" placeholder="Email or name" defaultValue={q} />
        </div>
        <button type="submit" className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>
      <div className="grid gap-3">
        {(rows ?? []).map((u) => (
          <Card key={u.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 py-3">
              <CardTitle className="text-base font-medium">{u.full_name ?? "—"}</CardTitle>
              <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
            </CardHeader>
            <CardContent className="py-0 pb-3 text-sm text-muted-foreground">
              <div className="font-mono text-xs">{u.email}</div>
              <div className="mt-1 text-xs">Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { createServerSupabase } from "@/lib/supabase/server";
import { AdminWinnerActions } from "@/components/admin/admin-winner-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WinnerRow = {
  id: string;
  user_id: string;
  draw_id: string;
  prize_tier: string;
  prize_cents: number;
  verification_status: string;
  payout_status: string;
  proof_storage_path: string | null;
};

export default async function AdminWinnersPage() {
  const supabase = await createServerSupabase();
  const { data: winners } = await supabase.from("winners").select("*").order("created_at", { ascending: false }).limit(80);

  const list = (winners ?? []) as WinnerRow[];
  const userIds = [...new Set(list.map((w) => w.user_id))];
  const drawIds = [...new Set(list.map((w) => w.draw_id))];

  const { data: profs } =
    userIds.length > 0
      ? await supabase.from("profiles").select("id, email, full_name").in("id", userIds)
      : { data: [] as { id: string; email: string | null; full_name: string | null }[] };

  const { data: draws } =
    drawIds.length > 0
      ? await supabase.from("draws").select("id, title").in("id", drawIds)
      : { data: [] as { id: string; title: string }[] };

  const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
  const drawMap = new Map((draws ?? []).map((d) => [d.id, d]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Winners</h1>
        <p className="mt-2 text-muted-foreground">Verify uploaded proofs and reconcile payouts.</p>
      </div>
      <div className="grid gap-4">
        {list.map((w) => {
          const p = profMap.get(w.user_id);
          const d = drawMap.get(w.draw_id);
          return (
            <Card key={w.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-medium">{p?.full_name ?? p?.email ?? "User"}</CardTitle>
                  <p className="text-xs text-muted-foreground">{d?.title}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">Proof: {w.verification_status}</Badge>
                  <Badge variant="secondary">Pay: {w.payout_status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Tier {w.prize_tier} · £{(w.prize_cents / 100).toFixed(2)}
                </p>
                {w.proof_storage_path && <p className="font-mono text-xs">Proof: {w.proof_storage_path}</p>}
                <AdminWinnerActions winnerId={w.id} />
              </CardContent>
            </Card>
          );
        })}
        {list.length === 0 && <p className="text-sm text-muted-foreground">No winner rows yet.</p>}
      </div>
    </div>
  );
}

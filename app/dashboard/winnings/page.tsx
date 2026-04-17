import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { WinnerProofForm } from "@/components/winner-proof-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WinnerRow = {
  id: string;
  draw_id: string;
  prize_tier: string;
  prize_cents: number;
  verification_status: string;
  payout_status: string;
  proof_storage_path: string | null;
};

export default async function WinningsPage() {
  const { user } = await requireUser();
  const supabase = await createServerSupabase();

  const { data: winners } = await supabase.from("winners").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  const drawIds = [...new Set((winners ?? []).map((w) => w.draw_id))];
  const { data: drawRows } =
    drawIds.length > 0
      ? await supabase.from("draws").select("id, title, period_month").in("id", drawIds)
      : { data: [] as { id: string; title: string; period_month: string }[] };

  const drawMap = new Map((drawRows ?? []).map((d) => [d.id, d]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Winnings</h1>
        <p className="mt-2 text-muted-foreground">
          Upload a clear screenshot of your official scorecard or app summary for admin verification. Payout moves from
          pending → approved → paid.
        </p>
      </div>

      <div className="grid gap-4">
        {(winners as WinnerRow[] | null)?.map((w) => {
          const d = drawMap.get(w.draw_id);
          return (
            <Card key={w.id}>
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                <CardTitle className="font-heading text-base">{d?.title ?? "Draw"}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">Proof: {w.verification_status}</Badge>
                  <Badge variant="secondary">Payout: {w.payout_status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Tier <span className="font-medium text-foreground">{w.prize_tier}</span> ·{" "}
                  {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(w.prize_cents / 100)}
                </p>
                <WinnerProofForm winnerId={w.id} existingPath={w.proof_storage_path} />
              </CardContent>
            </Card>
          );
        })}
        {(!winners || winners.length === 0) && (
          <p className="text-sm text-muted-foreground">No winning rows yet — good luck this month.</p>
        )}
      </div>
    </div>
  );
}

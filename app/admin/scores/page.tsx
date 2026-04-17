import { createServerSupabase } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

type ScoreRow = {
  id: string;
  user_id: string;
  score_date: string;
  points: number;
};

export default async function AdminScoresPage() {
  const supabase = await createServerSupabase();
  const { data: scores } = await supabase
    .from("scores")
    .select("id, user_id, score_date, points")
    .order("score_date", { ascending: false })
    .limit(100);

  const list = (scores ?? []) as ScoreRow[];
  const userIds = [...new Set(list.map((s) => s.user_id))];
  const { data: profs } =
    userIds.length > 0
      ? await supabase.from("profiles").select("id, email, full_name").in("id", userIds)
      : { data: [] as { id: string; email: string | null; full_name: string | null }[] };
  const profMap = new Map((profs ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Scores</h1>
        <p className="mt-2 text-muted-foreground">Latest Stableford entries across the membership.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {list.map((s) => {
              const p = profMap.get(s.user_id);
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium">{p?.full_name ?? p?.email ?? "User"}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.score_date} · {s.points} pts
                    </div>
                  </div>
                </div>
              );
            })}
            {list.length === 0 && <div className="p-6 text-sm text-muted-foreground">No scores yet.</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

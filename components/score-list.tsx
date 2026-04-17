"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteScoreAction } from "@/app/actions/scores";
import { Button } from "@/components/ui/button";

export type ScoreListItem = { id: string; score_date: string; points: number };

export function ScoreList({ scores, disabled }: { scores: ScoreListItem[]; disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <ul className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card/40">
      {scores.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
          <div>
            <div className="font-medium">{s.score_date}</div>
            <div className="text-xs text-muted-foreground">{s.points} points</div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={disabled || pending}
            onClick={() =>
              start(async () => {
                const r = await deleteScoreAction(s.id);
                if (!r.ok) toast.error(r.error ?? "Delete failed");
                else {
                  toast.success("Deleted");
                  router.refresh();
                }
              })
            }
          >
            Delete
          </Button>
        </li>
      ))}
      {scores.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">No scores yet.</li>}
    </ul>
  );
}

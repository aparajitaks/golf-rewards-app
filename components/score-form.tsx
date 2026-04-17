"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { scoreFormSchema, type ScoreFormValues } from "@/lib/schemas/score";
import { upsertScoreAction } from "@/app/actions/scores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScoreForm({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const form = useForm<ScoreFormValues>({
    resolver: zodResolver(scoreFormSchema),
    defaultValues: { score_date: new Date().toISOString().slice(0, 10), points: 36 },
  });

  function onSubmit(values: ScoreFormValues) {
    start(async () => {
      const res = await upsertScoreAction(values);
      if (!res.ok) {
        const msg = "_form" in (res.error ?? {}) ? (res.error as { _form?: string[] })._form?.[0] : "Could not save";
        toast.error(msg ?? "Could not save");
        return;
      }
      toast.success("Score saved");
      form.reset({ ...values, points: values.points });
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="score_date">Round date</Label>
          <Input id="score_date" type="date" disabled={disabled || pending} {...form.register("score_date")} />
          {form.formState.errors.score_date && (
            <p className="text-xs text-destructive">{form.formState.errors.score_date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="points">Stableford points (1–45)</Label>
          <Input id="points" type="number" min={1} max={45} disabled={disabled || pending} {...form.register("points", { valueAsNumber: true })} />
          {form.formState.errors.points && (
            <p className="text-xs text-destructive">{form.formState.errors.points.message}</p>
          )}
        </div>
      </div>
      <Button type="submit" disabled={disabled || pending}>
        {pending ? "Saving…" : "Save score"}
      </Button>
    </form>
  );
}

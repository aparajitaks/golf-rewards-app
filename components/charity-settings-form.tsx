"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Row = { id: string; name: string; slug: string };

export function CharitySettingsForm({
  charities,
  initialCharityId,
  initialContribution,
  initialIndependent,
}: {
  charities: Row[];
  initialCharityId: string | null;
  initialContribution: number;
  initialIndependent: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <form
      className="max-w-lg space-y-6 rounded-xl border border-border/70 bg-card/60 p-6"
      action={(fd) => {
        start(async () => {
          const charity_id = (fd.get("charity_id") as string) || null;
          const contribution_percent = Number(fd.get("contribution_percent"));
          const independent_donation_opt_in = fd.get("independent_donation_opt_in") === "on";
          const res = await updateProfileAction({ charity_id, contribution_percent, independent_donation_opt_in });
          if (!res.ok) toast.error("Could not update profile");
          else toast.success("Saved");
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="charity_id">Charity</Label>
        <select
          id="charity_id"
          name="charity_id"
          defaultValue={initialCharityId ?? ""}
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          disabled={pending}
        >
          <option value="">Select…</option>
          {charities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contribution_percent">Contribution % (10–100)</Label>
        <Input
          id="contribution_percent"
          name="contribution_percent"
          type="number"
          min={10}
          max={100}
          defaultValue={initialContribution}
          disabled={pending}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="independent_donation_opt_in" defaultChecked={initialIndependent} disabled={pending} />
        Interested in independent top-up donations (we will follow up)
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save charity settings"}
      </Button>
    </form>
  );
}

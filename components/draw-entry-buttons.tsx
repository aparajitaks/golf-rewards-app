"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { enterDrawAction, leaveDrawAction } from "@/app/actions/draw-entry";
import { Button } from "@/components/ui/button";

export function DrawEntryButtons({
  drawId,
  status,
  entered,
  canEnter,
}: {
  drawId: string;
  status: string;
  entered: boolean;
  canEnter: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  if (status !== "open") {
    return <span className="text-xs text-muted-foreground">{status === "published" ? "Closed" : "Not open"}</span>;
  }

  if (entered) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await leaveDrawAction(drawId);
            if (!r.ok) toast.error(r.error ?? "Could not leave");
            else {
              toast.success("Left draw");
              router.refresh();
            }
          })
        }
      >
        Leave draw
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending || !canEnter}
      title={!canEnter ? "Requires active subscription and five scores" : undefined}
      onClick={() =>
        start(async () => {
          const r = await enterDrawAction(drawId);
          if (!r.ok) toast.error(r.error ?? "Could not enter");
          else {
            toast.success("You are in the draw");
            router.refresh();
          }
        })
      }
    >
      Enter draw
    </Button>
  );
}

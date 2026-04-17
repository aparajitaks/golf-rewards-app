"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { publishDrawAction, simulateDrawAction } from "@/app/actions/draw-admin";
import { Button } from "@/components/ui/button";

export function AdminDrawActions({ drawId }: { drawId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await simulateDrawAction(drawId);
            if (!r.ok) toast.error(r.error ?? "Simulate failed");
            else {
              toast.success("Simulation saved", { description: JSON.stringify(r.simulation?.preview?.slice(0, 3)) });
              router.refresh();
            }
          })
        }
      >
        Simulate
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await publishDrawAction(drawId);
            if (!r.ok) toast.error(r.error ?? "Publish failed");
            else {
              toast.success("Draw published");
              router.refresh();
            }
          })
        }
      >
        Publish
      </Button>
    </div>
  );
}

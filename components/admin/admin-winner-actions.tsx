"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markWinnerPaidAction, verifyWinnerProofAction } from "@/app/actions/admin-winners";
import { Button } from "@/components/ui/button";

export function AdminWinnerActions({ winnerId }: { winnerId: string }) {
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
            const r = await verifyWinnerProofAction(winnerId, "approved");
            if (!r.ok) toast.error(r.error ?? "Failed");
            else {
              toast.success("Approved");
              router.refresh();
            }
          })
        }
      >
        Approve proof
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await verifyWinnerProofAction(winnerId, "rejected");
            if (!r.ok) toast.error(r.error ?? "Failed");
            else {
              toast.success("Rejected");
              router.refresh();
            }
          })
        }
      >
        Reject
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await markWinnerPaidAction(winnerId);
            if (!r.ok) toast.error(r.error ?? "Failed");
            else {
              toast.success("Marked paid");
              router.refresh();
            }
          })
        }
      >
        Mark paid
      </Button>
    </div>
  );
}

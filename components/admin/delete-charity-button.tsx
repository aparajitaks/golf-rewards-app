"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteCharityButton({
  id,
  action,
}: {
  id: string;
  action: (id: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (!confirm("Delete this charity?")) return;
          const r = await action(id);
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
  );
}

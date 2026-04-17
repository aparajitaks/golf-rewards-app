"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase";
import { attachWinnerProofAction } from "@/app/actions/winner-proof";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WinnerProofForm({ winnerId, existingPath }: { winnerId: string; existingPath: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const path = `${user.id}/${winnerId}-${file.name}`.replace(/\s+/g, "_");
      const { error: upErr } = await supabase.storage.from("winner-proofs").upload(path, file, { upsert: true });
      if (upErr) {
        toast.error(
          upErr.message.includes("Bucket not found")
            ? "Create the winner-proofs bucket in Supabase (see README)"
            : upErr.message,
        );
        return;
      }
      const res = await attachWinnerProofAction(winnerId, path);
      if (!res.ok) toast.error(res.error ?? "Could not save proof");
      else {
        toast.success("Proof uploaded");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`proof-${winnerId}`}>Winner proof (image)</Label>
      <Input id={`proof-${winnerId}`} type="file" accept="image/*" disabled={loading} onChange={(ev) => void onFile(ev)} />
      {existingPath && <p className="text-xs text-muted-foreground">Current file: {existingPath}</p>}
    </div>
  );
}

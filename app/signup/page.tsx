import { Suspense } from "react";
import { createServerSupabaseOrNull } from "@/lib/supabase/server";
import { SignupForm } from "@/components/signup-form";

export default async function SignupPage() {
  const supabase = await createServerSupabaseOrNull();
  const { data: charities } = supabase
    ? await supabase.from("charities").select("id, name").order("name")
    : { data: [] as { id: string; name: string }[] };

  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <SignupForm charities={charities ?? []} />
    </Suspense>
  );
}

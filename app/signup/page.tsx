import { Suspense } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { SignupForm } from "@/components/signup-form";

export default async function SignupPage() {
  const supabase = await createServerSupabase();
  const { data: charities } = await supabase.from("charities").select("id, name").order("name");

  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <SignupForm charities={charities ?? []} />
    </Suspense>
  );
}

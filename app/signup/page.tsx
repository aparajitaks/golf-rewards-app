import { createServerSupabase } from "@/lib/supabase/server";
import { SignupForm } from "@/components/signup-form";

export default async function SignupPage() {
  const supabase = await createServerSupabase();
  const { data: charities } = await supabase.from("charities").select("id, name").order("name");

  return <SignupForm charities={charities ?? []} />;
}

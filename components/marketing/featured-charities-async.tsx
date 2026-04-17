import { createServerSupabaseOrNull } from "@/lib/supabase/server";
import { FeaturedCharitiesSection } from "@/components/marketing/home-motion";

export async function FeaturedCharitiesAsync() {
  const supabase = await createServerSupabaseOrNull();
  if (!supabase) {
    return <FeaturedCharitiesSection charities={[]} />;
  }
  const { data: featured } = await supabase
    .from("charities")
    .select("id, name, slug, short_description")
    .eq("featured", true)
    .limit(4);

  return <FeaturedCharitiesSection charities={featured ?? []} />;
}

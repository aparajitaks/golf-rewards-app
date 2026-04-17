import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { CharitySettingsForm } from "@/components/charity-settings-form";

export default async function CharitySettingsPage() {
  const { profile } = await requireUser();
  const supabase = await createServerSupabase();
  const { data: charities } = await supabase.from("charities").select("id, name, slug").order("name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Charity settings</h1>
        <p className="mt-2 text-muted-foreground">
          Minimum 10% of your membership allocation goes to your chosen charity. You can raise that percentage or flag an
          independent donation pathway with our team.
        </p>
      </div>
      <CharitySettingsForm
        charities={charities ?? []}
        initialCharityId={profile?.charity_id ?? null}
        initialContribution={profile?.contribution_percent ?? 10}
        initialIndependent={profile?.independent_donation_opt_in ?? false}
      />
    </div>
  );
}

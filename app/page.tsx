import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  FaqSection,
  FeaturedCharitiesSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  PrizePoolSection,
  TestimonialsSection,
} from "@/components/marketing/home-motion";
import { Button } from "@/components/ui/button";

export const revalidate = 120;

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const { data: featured } = await supabase
    .from("charities")
    .select("id, name, slug, short_description")
    .eq("featured", true)
    .limit(4);

  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <PrizePoolSection />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
          <div>
            <h2 className="font-heading text-xl font-semibold">Charity impact, engineered</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Portfolios, not posters. You choose the cause, we handle receipts-grade transparency in the dashboard.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/charities">Explore directory</Link>
          </Button>
        </div>
      </section>
      <FeaturedCharitiesSection charities={featured ?? []} />
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-10 text-center">
          <p className="text-sm font-medium text-muted-foreground">Pricing</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Simple membership, serious infrastructure</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Monthly or annual via Stripe — cancel from the billing portal anytime.</p>
          <Button className="mt-6" asChild>
            <Link href="/pricing">Compare plans</Link>
          </Button>
        </div>
      </section>
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}

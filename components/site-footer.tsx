import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="font-semibold">Golf Rewards Charity</div>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Member draws, transparent prizes, and impact you direct — without the dated clubhouse aesthetic.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/charities" className="hover:text-foreground">
            Charities
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Log in
          </Link>
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Golf Rewards. Demo product — configure Supabase & Stripe for production.
      </div>
    </footer>
  );
}

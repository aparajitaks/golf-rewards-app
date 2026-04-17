import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("charities").select("name, short_description").eq("slug", slug).maybeSingle();
  if (!data) return { title: "Charity" };
  return { title: data.name, description: data.short_description ?? undefined };
}

export default async function CharityProfilePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data: c } = await supabase.from("charities").select("*").eq("slug", slug).maybeSingle();
  if (!c) notFound();

  const events = (Array.isArray(c.events) ? c.events : []) as { title?: string; date?: string; description?: string }[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/charities" className="text-sm text-muted-foreground hover:text-foreground">
        ← Directory
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">{c.name}</h1>
          <p className="mt-2 text-muted-foreground">{c.short_description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(c.tags ?? []).map((t: string) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        </div>
        {c.website_url && (
          <a
            href={c.website_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Visit website
          </a>
        )}
      </div>

      <Separator className="my-10" />

      <section className="space-y-4">
        <h2 className="font-heading text-xl font-semibold">Mission</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{c.mission ?? "Impact statement coming soon."}</p>
        {c.description && <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>}
      </section>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle className="font-heading">Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {events.length === 0 && <p className="text-sm text-muted-foreground">No upcoming events listed.</p>}
          {events.map((e, i) => (
            <div key={i} className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
              <div className="font-medium">{e.title ?? "Event"}</div>
              {e.date && <div className="text-xs text-muted-foreground">{e.date}</div>}
              {e.description && <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-10">
        <Link href="/signup" className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-300">
          Select this charity during signup →
        </Link>
      </div>
    </div>
  );
}

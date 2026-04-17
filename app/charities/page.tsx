import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseOrNull } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Charity directory",
  description: "Browse partner charities, filter by cause, and read impact stories.",
};

export default async function CharitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const tag = (sp.tag ?? "").trim();

  const supabase = await createServerSupabaseOrNull();
  if (!supabase) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-heading text-2xl font-bold">Charity directory</h1>
        <p className="mt-4 text-muted-foreground">Connect Supabase in environment variables to load charities.</p>
      </div>
    );
  }
  let query = supabase.from("charities").select("id, name, slug, short_description, tags, featured").order("featured", { ascending: false });
  if (q) {
    query = query.or(`name.ilike.%${q}%,short_description.ilike.%${q}%`);
  }
  if (tag) {
    query = query.contains("tags", [tag]);
  }
  const { data: rows } = await query;

  const tags = Array.from(
    new Set((rows ?? []).flatMap((r) => (Array.isArray(r.tags) ? (r.tags as string[]) : []))),
  ).slice(0, 12) as string[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-bold tracking-tight">Charity directory</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">Search by keyword or filter by tag. Every profile includes mission copy and upcoming events.</p>

      <form method="get" className="mt-8 flex flex-col gap-4 rounded-xl border border-border/70 bg-card/60 p-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="q">Search</Label>
          <Input id="q" name="q" placeholder="Name or description" defaultValue={q} />
        </div>
        <div className="w-full space-y-2 sm:w-48">
          <Label htmlFor="tag">Tag</Label>
          <Input id="tag" name="tag" placeholder="e.g. youth" defaultValue={tag} />
        </div>
        <button type="submit" className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
          Apply
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link key={t} href={`/charities?tag=${encodeURIComponent(t)}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              {t}
            </Badge>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(rows ?? []).map((c) => (
          <Link key={c.id} href={`/charities/${c.slug}`}>
            <Card className="h-full transition hover:border-violet-500/40 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-heading text-lg font-semibold">{c.name}</h2>
                  {c.featured && <Badge variant="secondary">Featured</Badge>}
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.short_description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {((c.tags ?? []) as string[]).slice(0, 4).map((t: string) => (
                    <Badge key={t} variant="outline" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {(rows ?? []).length === 0 && <p className="mt-8 text-sm text-muted-foreground">No charities match your filters.</p>}
    </div>
  );
}

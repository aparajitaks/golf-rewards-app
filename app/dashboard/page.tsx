import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { isPremiumActive } from "@/lib/subscription";
import type { SubscriptionRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
  const { user, profile } = await requireUser();
  const supabase = await createServerSupabase();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const premium = isPremiumActive(sub as SubscriptionRow | null);

  const { data: scores } = await supabase
    .from("scores")
    .select("id, score_date, points")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false });

  const { data: charity } = profile?.charity_id
    ? await supabase.from("charities").select("name").eq("id", profile.charity_id).maybeSingle()
    : { data: null };

  const { data: draws } = await supabase
    .from("draws")
    .select("id, title, status, period_month, closes_at")
    .in("status", ["open", "closed", "published"])
    .order("period_month", { ascending: false })
    .limit(4);

  const { data: entryRows } = await supabase.from("draw_entries").select("draw_id").eq("user_id", user.id).limit(20);
  const drawIds = [...new Set((entryRows ?? []).map((r) => r.draw_id))];
  const { data: entryDraws } =
    drawIds.length > 0
      ? await supabase.from("draws").select("id, title, status").in("id", drawIds)
      : { data: [] as { id: string; title: string; status: string }[] };

  const { data: notifs } = await supabase
    .from("notifications")
    .select("id, title, body, created_at, read_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">Your membership hub — subscription, scores, draws, and impact settings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="font-heading">Subscription</CardTitle>
            <Badge variant={premium ? "success" : "secondary"}>{premium ? "Active" : "Inactive"}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {premium && sub?.current_period_end && (
              <p className="text-muted-foreground">
                Renews on{" "}
                <span className="font-medium text-foreground">
                  {new Date(sub.current_period_end).toLocaleDateString(undefined, { dateStyle: "medium" })}
                </span>
                .
              </p>
            )}
            {!premium && (
              <p className="text-muted-foreground">
                Subscribe to unlock score entry, draw participation, and premium dashboard modules.
              </p>
            )}
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/subscription">Manage subscription</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Charity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{charity?.name ?? "Not selected"}</p>
            <p className="mt-2 text-muted-foreground">Contribution: {profile?.contribution_percent ?? 10}%</p>
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link href="/dashboard/charity">Adjust settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading text-lg">Stableford scores</CardTitle>
            <span className="text-xs text-muted-foreground">{(scores ?? []).length} / 5</span>
          </CardHeader>
          <CardContent>
            {!premium ? (
              <p className="text-sm text-muted-foreground">Activate membership to add or edit scores.</p>
            ) : (scores ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No scores yet — add your latest five rounds.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {(scores ?? []).map((s) => (
                  <li key={s.id} className="flex justify-between rounded-lg border border-border/60 px-3 py-2">
                    <span className="text-muted-foreground">{s.score_date}</span>
                    <span className="font-semibold">{s.points} pts</span>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link href="/dashboard/scores">Open score manager</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Upcoming draws</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(draws ?? []).map((d) => (
                <li key={d.id} className="flex flex-col rounded-lg border border-border/60 px-3 py-2">
                  <span className="font-medium">{d.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">{d.status}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link href="/dashboard/draws">Draws & entries</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Past draw entries</CardTitle>
        </CardHeader>
        <CardContent>
          {(entryDraws ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">You have not entered a draw yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(entryDraws ?? []).map((d) => (
                <li key={d.id} className="flex justify-between gap-2 rounded-lg border border-border/60 px-3 py-2">
                  <span>{d.title}</span>
                  <span className="text-xs capitalize text-muted-foreground">{d.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(notifs ?? []).length === 0 && <p className="text-sm text-muted-foreground">You are all caught up.</p>}
          {(notifs ?? []).map((n) => (
            <div key={n.id} className="rounded-lg border border-border/60 px-3 py-2">
              <div className="text-sm font-medium">{n.title}</div>
              {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Separator />
      <p className="text-xs text-muted-foreground">
        Signed in as <span className="font-mono text-foreground">{user.email}</span>
      </p>
    </div>
  );
}

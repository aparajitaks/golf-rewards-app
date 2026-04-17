import React from "react";
import Navbar from "@/components/navbar";
import { requireUser } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const { user, profile } = await requireUser();

  // fetch bookings & rewards server-side
  const { getServerSupabase } = await import("@/lib/supabase-server");
  const supabase = await getServerSupabase();

  const bookingsRes = await supabase
    .from("bookings")
    .select("id, course_id, start_at, status, course:course_id ( id, name, slug, image_url )")
    .eq("user_id", user.id)
    .order("start_at", { ascending: true })
    .limit(6);

  const rewardsRes = await supabase.from("rewards").select("points_total").eq("user_id", user.id).maybeSingle();

  const upcoming = (bookingsRes.data ?? []) as any[];
  const points = rewardsRes.data?.points_total ?? profile?.points ?? 0;
  const membership = profile?.membership ?? "free";

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 via-slate-900 to-black text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-2xl bg-slate-800/60 p-6 border border-slate-800 shadow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-amber-300">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
                  <p className="mt-1 text-slate-400">Your dashboard — bookings, rewards and quick actions.</p>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-300">Membership</div>
                  <div className="mt-1 inline-flex items-center rounded-full bg-slate-900/60 px-3 py-1 text-xs font-semibold text-amber-200">
                    {membership === "premium" ? "Premium" : "Member"}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-slate-800/60 p-6 border border-slate-800 shadow">
              <h2 className="text-lg font-semibold text-amber-200">Quick actions</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/courses" className="block rounded-lg bg-linear-to-tr from-slate-900/40 to-slate-800/40 p-4 hover:scale-[1.01] transition">
                  <div className="text-sm text-slate-300">Browse</div>
                  <div className="mt-2 font-semibold text-xl">Courses</div>
                </Link>
                <Link href="/rewards" className="block rounded-lg bg-linear-to-tr from-slate-900/40 to-slate-800/40 p-4 hover:scale-[1.01] transition">
                  <div className="text-sm text-slate-300">View</div>
                  <div className="mt-2 font-semibold text-xl">My Rewards</div>
                </Link>
                <Link href="/bookings" className="block rounded-lg bg-linear-to-tr from-slate-900/40 to-slate-800/40 p-4 hover:scale-[1.01] transition">
                  <div className="text-sm text-slate-300">Manage</div>
                  <div className="mt-2 font-semibold text-xl">My Bookings</div>
                </Link>
              </div>
            </section>

            <section className="rounded-2xl bg-slate-800/60 p-6 border border-slate-800 shadow">
              <h2 className="text-lg font-semibold text-amber-200">Upcoming bookings</h2>
              <div className="mt-4 space-y-3">
                {upcoming.length === 0 ? (
                  <div className="text-slate-400">No upcoming bookings. Browse courses to book your next round.</div>
                ) : (
                  upcoming.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-4 rounded-md bg-slate-900/30 p-3">
                      <div>
                        <div className="font-semibold">{b.course?.name ?? "Course"}</div>
                        <div className="text-sm text-slate-400">{new Date(b.start_at).toLocaleString()}</div>
                      </div>
                      <div className="text-sm text-slate-300">{b.status}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-linear-to-b from-slate-800/50 to-slate-900 p-6 border border-slate-800 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-300">Rewards points</div>
                  <div className="mt-2 text-3xl font-extrabold text-amber-300">{points}</div>
                </div>
                <div>
                  <Link href="/rewards" className="rounded-md bg-emerald-600 px-3 py-1 text-sm font-semibold">
                    Redeem
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/60 p-6 border border-slate-800 shadow">
              <h3 className="text-sm text-slate-300">Account</h3>
              <div className="mt-3 space-y-2">
                <div className="text-sm text-slate-400">Email</div>
                <div className="font-mono text-sm">{user.email}</div>
                <div className="text-sm text-slate-400 mt-3">Member since</div>
                <div className="text-sm">{new Date(user.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/60 p-6 border border-slate-800 shadow">
              <h3 className="text-sm text-slate-300">Support</h3>
              <div className="mt-3">
                <a href="mailto:support@golfrewards.example" className="text-sm text-emerald-300 hover:underline">
                  Contact support
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

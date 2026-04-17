"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name?: string | null;
  membership?: "free" | "premium" | null;
  points?: number | null;
};

export default function Navbar() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let mounted = true;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user ?? null;
      if (!mounted) return;
      setUser(u);
      if (u) {
        const { data } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
        if (mounted) setProfile(data ?? null);
      } else {
        setProfile(null);
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (!nextUser) setProfile(null);
      if (nextUser) {
        supabase.from("profiles").select("*").eq("id", nextUser.id).maybeSingle().then((r) => setProfile(r.data ?? null));
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/');
  }

  return (
    <header className="w-full bg-slate-900 text-slate-100 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="rounded-full bg-green-900 p-2 ring-1 ring-green-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gold-400" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#D4AF37" />
                </svg>
              </div>
              <span className="text-xl font-semibold tracking-tight">Golf Rewards</span>
            </Link>

            <nav className="hidden md:flex items-center gap-3 text-sm">
              <Link href="/dashboard" className={`px-3 py-2 rounded-md ${pathname === "/dashboard" ? "bg-slate-800" : "hover:bg-slate-800"}`}>
                Dashboard
              </Link>
              <Link href="/courses" className={`px-3 py-2 rounded-md ${pathname?.startsWith("/courses") ? "bg-slate-800" : "hover:bg-slate-800"}`}>
                Courses
              </Link>
              <Link href="/rewards" className={`px-3 py-2 rounded-md ${pathname === "/rewards" ? "bg-slate-800" : "hover:bg-slate-800"}`}>
                Rewards
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <div className="text-sm text-slate-300 text-right">
                    <div className="font-medium">{profile?.full_name ?? user.email}</div>
                    <div className="text-xs text-slate-500">{profile?.membership === "premium" ? "Premium member" : "Member"}</div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 rounded-md bg-linear-to-r from-emerald-600 to-emerald-500 px-3 py-1 text-sm font-medium shadow hover:opacity-95"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-3 py-1.5 rounded-md text-sm bg-slate-800 hover:bg-slate-700">
                    Login
                  </Link>
                  <Link href="/signup" className="px-3 py-1.5 rounded-md text-sm bg-amber-700 text-slate-900 font-semibold hover:opacity-95">
                    Sign up
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden">
              <button
                aria-label="Toggle menu"
                onClick={() => setOpen((s) => !s)}
                className="inline-flex items-center justify-center rounded-md bg-slate-800 p-2 hover:bg-slate-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800">
          <div className="px-4 pt-4 pb-6 space-y-3">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-slate-800">Dashboard</Link>
            <Link href="/courses" className="block px-3 py-2 rounded-md hover:bg-slate-800">Courses</Link>
            <Link href="/rewards" className="block px-3 py-2 rounded-md hover:bg-slate-800">Rewards</Link>

            <div className="pt-2 border-t border-slate-800">
              {user ? (
                <div className="space-y-2">
                  <div className="text-sm text-slate-300">{profile?.full_name ?? user.email}</div>
                  <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-md bg-amber-700 text-slate-900 font-semibold">Sign out</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" className="px-3 py-2 rounded-md bg-slate-800 text-center">Login</Link>
                  <Link href="/signup" className="px-3 py-2 rounded-md bg-amber-700 text-slate-900 text-center font-semibold">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

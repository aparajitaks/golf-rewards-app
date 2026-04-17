"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileLite = { full_name?: string | null; role?: string | null };

const nav = [
  { href: "/concept", label: "How it works" },
  { href: "/charities", label: "Charities" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user ?? null;
      if (!mounted) return;
      setUser(u ? { id: u.id, email: u.email } : null);
      if (u) {
        const { data: p } = await supabase.from("profiles").select("full_name, role").eq("id", u.id).maybeSingle();
        if (mounted) setProfile(p ?? null);
      } else setProfile(null);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getUser().then(({ data }) => {
        const u = data?.user ?? null;
        setUser(u ? { id: u.id, email: u.email } : null);
        if (!u) setProfile(null);
        else {
          supabase.from("profiles").select("full_name, role").eq("id", u.id).maybeSingle().then((r) => setProfile(r.data ?? null));
        }
      });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white shadow-lg shadow-violet-500/25">
              GR
            </span>
            <span className="hidden sm:inline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-base">
              Golf Rewards
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  pathname === item.href && "bg-muted text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/dashboard"
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  pathname?.startsWith("/dashboard") && "bg-muted text-foreground",
                )}
              >
                Dashboard
              </Link>
            )}
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  pathname?.startsWith("/admin") && "bg-muted text-foreground",
                )}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <span className="max-w-[140px] truncate text-xs text-muted-foreground">{profile?.full_name ?? user.email}</span>
                <Button variant="outline" size="sm" onClick={() => void signOut()}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Join</Link>
                </Button>
              </>
            )}
          </div>
          <button
            type="button"
            className="inline-flex rounded-md p-2 md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-md px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            {user && (
              <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
            )}
            {profile?.role === "admin" && (
              <Link href="/admin" className="rounded-md px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                Admin
              </Link>
            )}
            <div className="mt-2 border-t border-border pt-3">
              {user ? (
                <Button className="w-full" variant="outline" onClick={() => void signOut()}>
                  Sign out
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href="/signup">Join</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/scores", label: "Scores" },
  { href: "/dashboard/draws", label: "Draws" },
  { href: "/dashboard/winnings", label: "Winnings" },
  { href: "/dashboard/charity", label: "Charity" },
  { href: "/dashboard/subscription", label: "Subscription" },
];

export function DashboardShell({ children, isAdmin }: { children: React.ReactNode; isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:px-6">
      <aside className="w-full shrink-0 sm:w-52">
        <nav className="flex flex-row gap-1 overflow-x-auto rounded-xl border border-border/70 bg-card/60 p-1 sm:flex-col sm:overflow-visible">
          {links.map((l) => {
            const active = l.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-sm transition",
                  active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg px-3 py-2 text-sm font-medium text-violet-600 hover:bg-muted dark:text-violet-300"
            >
              Admin portal →
            </Link>
          )}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

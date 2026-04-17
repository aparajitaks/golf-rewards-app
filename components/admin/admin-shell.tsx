"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/scores", label: "Scores" },
  { href: "/admin/draws", label: "Draws" },
  { href: "/admin/charities", label: "Charities" },
  { href: "/admin/winners", label: "Winners" },
  { href: "/admin/reports", label: "Reports" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:px-6">
      <aside className="w-full shrink-0 sm:w-52">
        <div className="mb-4 rounded-xl border border-border/70 bg-card/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
          <p className="mt-1 text-sm font-medium">Operations</p>
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto rounded-xl border border-border/70 bg-card/60 p-1 sm:flex-col sm:overflow-visible">
          {links.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
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
        </nav>
        <Link href="/dashboard" className="mt-4 block text-sm text-muted-foreground hover:text-foreground">
          ← Member dashboard
        </Link>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

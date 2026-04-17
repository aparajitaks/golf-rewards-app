import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
]);

const PUBLIC_PREFIXES = [
  "/",
  "/pricing",
  "/charities",
  "/concept",
  "/checkout",
  "/api/stripe/webhook",
];

function isPublicPath(pathname: string) {
  if (AUTH_PATHS.has(pathname)) return true;
  for (const p of PUBLIC_PREFIXES) {
    if (p === "/" && pathname === "/") return true;
    if (p !== "/" && pathname === p) return true;
    if (p !== "/" && pathname.startsWith(`${p}/`)) return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const { response, supabase } = await updateSession(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");

  if (user && AUTH_PATHS.has(pathname)) {
    const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
    return NextResponse.redirect(new URL(next, request.url));
  }

  if ((isDashboard || isAdmin) && !user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (isAdmin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (!user && !isPublicPath(pathname) && !AUTH_PATHS.has(pathname)) {
    // Unknown routes default to allow (e.g. future pages). Tighten if needed.
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

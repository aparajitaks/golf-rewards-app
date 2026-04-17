import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.profile?.role !== "admin") {
    redirect("/dashboard");
  }
  return ctx;
}

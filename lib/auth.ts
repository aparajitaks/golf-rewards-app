// lib/auth.ts
// Server-side auth helpers for Next.js App Router
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { getServerSupabase } from "./supabase-server";

// Server-side helper that validates the authenticated user by calling
// Supabase's auth.getUser() which verifies the session with the Auth server.
export async function requireUser() {
  const supabase = (await getServerSupabase()) as SupabaseClient;

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    // On unexpected supabase error, redirect to login to be safe
    return redirect('/login');
  }

  const user = data?.user ?? null;

  if (!user) {
    return redirect('/login');
  }

  // fetch profile from 'profiles' table if present
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return { user, profile: profile as Profile | null };
}

export async function getCurrentUser() {
  const supabase = (await getServerSupabase()) as SupabaseClient;
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

// lib/auth.ts
// Server-side auth helpers for Next.js App Router
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getServerSupabase } from './supabase-server';

export async function requireUser() {
  const supabase = getServerSupabase() as SupabaseClient;

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    // On unexpected supabase error, redirect to login to be safe
    return redirect('/login');
  }

  if (!session || !session.user) {
    redirect('/login');
  }

  const user = session.user;

  // fetch profile from 'profiles' table if present
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return { user, profile };
}

export async function getCurrentUser() {
  const supabase = getServerSupabase() as SupabaseClient;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}

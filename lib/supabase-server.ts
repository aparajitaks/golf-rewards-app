// lib/supabase-server.ts
// Server-side Supabase client factory for Next.js App Router.
// Use in server components or route handlers to access data scoped to the current user session.
//
// Example:
//   const supabase = getServerSupabase();
//   const { data: session } = await supabase.auth.getSession();

import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

export async function getServerSupabase(): Promise<SupabaseClient> {
  // This function must only be called from server-side context (Server Component, Route Handler)
  if (typeof window !== 'undefined') {
    throw new Error('getServerSupabase must be called from the server.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment');
  }

  // Use cookies() from next/headers to bind the Supabase client to the incoming request cookies.
  // createServerClient expects cookie helpers (getAll/setAll). We'll provide a minimal adapter
  // that reads Next's request cookies. setAll is intentionally omitted here —
  // if your app needs to write auth cookies server-side (token refresh) you should implement
  // middleware that handles setAll and pass a full cookie adapter.
  // cookies() can be environment/version-dependent and in some Next versions returns a Promise.
  // Detect both sync and async shapes and normalize into a sync array for the adapter.
  const cookieStoreAny: any = cookies();

  // If cookies() returned a Promise (some environments), await it.
  const maybeCookieStore = typeof cookieStoreAny?.then === 'function' ? await cookieStoreAny : cookieStoreAny;

  // Build a synchronous array of cookie objects { name, value }
  let normalized: Array<{ name: string; value: string }> = [];
  try {
    if (maybeCookieStore) {
      // If there's a getAll function, it might return a Promise or an array.
      if (typeof maybeCookieStore.getAll === 'function') {
        const res = maybeCookieStore.getAll();
        const all = typeof res?.then === 'function' ? await res : res;
        if (Array.isArray(all)) {
          normalized = all.map((c: any) => ({ name: String(c.name), value: String(c.value) }));
        }
      } else if (Array.isArray(maybeCookieStore)) {
        normalized = maybeCookieStore.map((c: any) => ({ name: String(c.name), value: String(c.value) }));
      }
    }
  } catch (err) {
    normalized = [];
  }

  const cookieMethods = {
    // Return array of { name, value }
    getAll: () => normalized,
    // setAll is intentionally omitted. If your application needs to write auth cookies
    // server-side (token refresh), implement setAll in middleware and pass a full
    // adapter there.
  } as const;

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: cookieMethods as any,
  }) as SupabaseClient;

  return supabase;
}
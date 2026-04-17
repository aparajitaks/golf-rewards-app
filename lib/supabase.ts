// lib/supabase.ts
// Client-side Supabase helper for Next.js App Router
// Usage: import { getBrowserSupabase } from 'lib/supabase' in React client components.

import { SupabaseClient } from '@supabase/supabase-js';
/**
 * Use the createBrowserClient factory from @supabase/ssr (2026 API).
 * The library exports `createBrowserClient`.
 */
import { createBrowserClient } from '@supabase/ssr';

let browserClient: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (typeof window === 'undefined') {
    throw new Error('getBrowserSupabase must be called from the browser.');
  }

  if (!browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anon) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    // createBrowserClient config: pass url and anon key
    browserClient = createBrowserClient(url, anon, {
      // optional: isSingleton to reuse the client instance across modules
      isSingleton: true,
    }) as SupabaseClient;
  }

  return browserClient;
}
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        router.replace(next);
      }
    });
    return () => sub?.subscription.unsubscribe();
  }, [router, next]);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // If sign in succeeded and session is returned, redirect immediately.
      const session = (data as any)?.session ?? null;
      if (session && session.access_token) {
        router.replace(next);
        return;
      }

      // Otherwise wait for onAuthStateChange as a fallback (e.g. OAuth flows)
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const supabase = getBrowserSupabase();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold mb-6">Sign in to Golf Rewards</h1>

        <Button onClick={handleGoogle} variant="outline" className="w-full mb-4 flex items-center justify-center gap-2">
          <LogIn className="w-5 h-5" />
          Continue with Google
        </Button>

        <div className="my-4 text-center text-sm text-slate-400">or use your email</div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-sky-500 p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-sky-500 p-2"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between">
            <Button type="submit" disabled={loading} className="inline-flex items-center">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <a href="/forgot-password" className="text-sm text-sky-600 hover:underline">
              Forgot password?
            </a>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to Golf Rewards? <a href="/signup" className="text-sky-600 hover:underline">Create an account</a>
        </p>

        <div className="mt-6 text-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

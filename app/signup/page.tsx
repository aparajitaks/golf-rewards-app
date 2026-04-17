"use client";
import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabase();
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) throw error;
      // Successful signup: Supabase may require email confirmation depending on settings
      setMessage('Signup successful. Check your email to confirm (if required). Redirecting...');
      setTimeout(() => {
        router.push(next);
      }, 1200);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold mb-6">Create your account</h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-sky-500 p-2"
            />
          </div>

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
          {message && <div className="text-sm text-emerald-600">{message}</div>}

          <div className="flex items-center justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </Button>

            <a href="/login" className="text-sm text-sky-600 hover:underline">
              Already have an account?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

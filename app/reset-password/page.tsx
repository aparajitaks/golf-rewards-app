"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // The reset link usually includes an access token in the URL which supabase will exchange
  // and store in the cookie automatically on redirect. We only need to call updateUser.
  useEffect(() => {
    // If there's an error param in the URL, show it.
    const err = params?.get('error_description') || params?.get('error');
    if (err) setError(err);
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!password) {
      setError('Please enter a new password.');
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const supabase = getBrowserSupabase();
      // updateUser will set the new password for the currently authenticated user
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage('Password updated — you can now sign in with your new password. Redirecting to login...');
      setTimeout(() => router.replace('/login'), 1400);
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold mb-4">Choose a new password</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">New password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-sky-500 p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm password</label>
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:ring-2 focus:ring-sky-500 p-2" />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {message && <div className="text-sm text-emerald-600">{message}</div>}

          <div>
            <button className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700" disabled={loading}>
              {loading ? 'Updating...' : 'Set new password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

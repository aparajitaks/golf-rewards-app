"use client";
import React, { useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      });
      if (error) throw error;
      setMessage('If your email is registered, you will receive reset instructions.');
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-semibold mb-4">Reset your password</h1>
        <p className="text-sm text-slate-600 mb-6">Enter your account email and we'll send password reset instructions.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && <div className="text-sm text-red-600">{error}</div>}
          {message && <div className="text-sm text-emerald-600">{message}</div>}

          <div>
            <button className="inline-flex items-center px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

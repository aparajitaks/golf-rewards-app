"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get('next') ?? '/dashboard';
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    (async () => {
      try {
        const supabase = getBrowserSupabase();
        // Try to get session — Supabase client should have set cookies on redirect
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          // Not fatal — continue to next
          console.warn('getSession error', error);
        }
        // Redirect to next destination
        router.replace(next);
      } catch (err) {
        console.error(err);
        router.replace('/login');
      }
    })();
  }, [router, next]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-6 rounded shadow">
        <p>{message}</p>
      </div>
    </div>
  );
}

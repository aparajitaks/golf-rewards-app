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
        // After OAuth redirect Supabase should set the session cookie.
        // Call getUser() which verifies the session with Supabase Auth.
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.warn('getUser error after callback', error);
        }

        // If a user exists we can safely redirect to next; otherwise go to login.
        if (data?.user) {
          router.replace(next);
        } else {
          router.replace('/login');
        }
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

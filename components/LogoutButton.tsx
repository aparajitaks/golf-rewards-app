"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    setLoading(false);
    router.push('/');
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
      disabled={loading}
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  );
}

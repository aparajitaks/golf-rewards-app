import React from 'react';
import { requireUser } from '../../lib/auth';
import LogoutButton from '../../components/LogoutButton';
import { Button } from '../../components/ui/button';

export default async function DashboardPage() {
  const { user, profile } = await requireUser();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-slate-600">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}.</p>
          </div>
          <div>
            <LogoutButton />
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-lg font-medium">Account</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <div className="text-sm text-slate-500">User ID</div>
              <div className="mt-1 font-mono text-sm">{user.id}</div>
            </div>
            <div className="p-4 border rounded">
              <div className="text-sm text-slate-500">Email</div>
              <div className="mt-1">{user.email ?? '—'}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

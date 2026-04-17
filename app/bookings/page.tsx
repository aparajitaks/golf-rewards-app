import React from 'react';
import { requireUser } from '@/lib/auth';
import { getServerSupabase } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function BookingsPage() {
  const { user } = await requireUser();
  const supabase = await getServerSupabase();

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, course_id, course: golf_courses(name, slug), tee_time, players, status')
    .eq('user_id', user.id)
    .order('tee_time', { ascending: false });

  if (error) {
    console.error('Failed to load bookings', error);
    return notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your bookings</h1>
          <Button onClick={() => { /* placeholder for new booking flow */ }}>New booking</Button>
        </header>

        <section className="space-y-4">
          {bookings && bookings.length > 0 ? (
            bookings.map((b: any) => (
              <div key={b.id} className="bg-white shadow rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{b.course?.name ?? 'Unknown course'}</div>
                  <div className="text-sm text-slate-500">{new Date(b.tee_time).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{b.players} player{b.players !== 1 ? 's' : ''}</div>
                  <div className="text-xs text-slate-500">{b.status}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded shadow p-6 text-center text-slate-600">You don't have any bookings yet.</div>
          )}
        </section>
      </div>
    </div>
  );
}

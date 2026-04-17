import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-8">
        <h1 className="text-3xl font-bold mb-4">About Golf Rewards</h1>
        <p className="text-slate-700 mb-4">
          Golf Rewards helps golfers and golf clubs connect. Earn points for bookings, redeem rewards, and discover new courses in your area.
        </p>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h2 className="text-xl font-semibold">For golfers</h2>
            <p className="text-slate-600 mt-2">Track your rounds, earn points, and unlock exclusive offers at participating courses.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">For courses</h2>
            <p className="text-slate-600 mt-2">Grow your bookings and reward loyal customers with flexible rewards and promo tools.</p>
          </div>
        </section>

        <div className="mt-8 text-center">
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-md bg-amber-700 text-slate-900 px-4 py-2 font-semibold">See pricing</Link>
        </div>
      </div>
    </div>
  );
}

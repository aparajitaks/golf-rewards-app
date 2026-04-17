import React from 'react';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Pricing</h1>
        <p className="text-slate-700 mb-6">Simple plans for clubs and golfers. No surprises — upgrade or cancel anytime.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded p-6 text-center">
            <h3 className="text-xl font-semibold">Free</h3>
            <div className="text-3xl font-bold my-4">$0</div>
            <ul className="text-sm text-slate-600 space-y-2 mb-4">
              <li>Basic bookings</li>
              <li>Earn points</li>
              <li>Community support</li>
            </ul>
            <Button variant="outline">Get started</Button>
          </div>

          <div className="bg-white border rounded p-6 text-center">
            <h3 className="text-xl font-semibold">Pro</h3>
            <div className="text-3xl font-bold my-4">$19</div>
            <ul className="text-sm text-slate-600 space-y-2 mb-4">
              <li>Priority support</li>
              <li>Advanced booking features</li>
              <li>Promotions & coupons</li>
            </ul>
            <Button>Start free trial</Button>
          </div>

          <div className="bg-white border rounded p-6 text-center">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <div className="text-3xl font-bold my-4">Contact us</div>
            <ul className="text-sm text-slate-600 space-y-2 mb-4">
              <li>Custom integrations</li>
              <li>Dedicated success manager</li>
              <li>SLA and onboarding</li>
            </ul>
            <Button variant="ghost">Contact sales</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-[#081018] via-[#07121a] to-[#021014] text-slate-50">
      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-linear-to-tr from-emerald-400 via-yellow-400 to-yellow-600 rounded-full flex items-center justify-center ring-1 ring-white/10 shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 2C14.2 6 18 9 22 10C18 12 14 16 12 22C10 16 6 12 2 10C6 9 9.8 6 12 2Z" fill="#05201A" />
              <path d="M12 5.5C13.2 7.2 15.5 8.3 18 8.3C15.5 9.7 13.5 11.9 12 15C10.5 11.9 8.5 9.7 6 8.3C8.5 8.3 10.8 7.2 12 5.5Z" fill="#F5E6B8" />
            </svg>
          </div>

          <div>
            <Link href="/" className="text-lg font-extrabold tracking-tight">
              <span className="text-emerald-300">Golf</span>
              <span className="text-slate-100">Rewards</span>
            </Link>
            <div className="text-xs text-slate-400 -mt-0.5">Luxury tee times • VIP benefits</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/courses" className="text-sm text-slate-300 hover:text-white">
            Browse courses
          </Link>
          <Link href="/about" className="text-sm text-slate-300 hover:text-white">
            How it works
          </Link>
          <Link href="/pricing" className="text-sm text-slate-300 hover:text-white">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-200 hover:text-white">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-linear-to-r from-yellow-400 to-amber-500 text-slate-900">
              Sign up
            </Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-2/3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Play the world’s most exclusive courses. Earn rewards. Live the green life.
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl">
            Golf Rewards is a premium membership and booking platform that connects passionate golfers with luxury courses,
            VIP perks, and a best-in-class rewards program. Discover curated tee-times, unlock member benefits and elevate
            every round.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-linear-to-r from-emerald-400 to-yellow-400 text-slate-900">
                Get started — join free
              </Button>
            </Link>

            <Link href="/courses">
              <Button variant="outline" size="lg" className="text-slate-200 border-slate-600">
                View courses
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-400">
            <div className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-emerald-400 rounded-full" />
              Curated tee-times at 150+ partner courses
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full" />
              Industry-leading rewards & VIP experiences
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-slate-400 rounded-full" />
              Secure bookings • Flexible cancellations
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3">
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5 bg-slate-900 p-5">
            <div className="h-48 w-full rounded-md overflow-hidden bg-linear-to-tr from-slate-800 to-slate-700">
              {/* Placeholder hero image */}
              <svg className="w-full h-full" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <linearGradient id="g" x1="0" x2="1">
                    <stop offset="0" stopColor="#023226" />
                    <stop offset="1" stopColor="#1a3d2d" />
                  </linearGradient>
                </defs>
                <rect width="800" height="400" fill="url(#g)" />
                <g fill="#F5E6B8" opacity="0.09">
                  <circle cx="120" cy="150" r="120" />
                  <circle cx="640" cy="100" r="120" />
                </g>
                <g fill="#F5E6B8" opacity="0.16">
                  <path d="M80 260 Q210 160 340 220 T600 240" stroke="none" />
                </g>
              </svg>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">Featured course</div>
                  <div className="text-lg font-semibold">Pebble Beach Golf Links</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">From</div>
                  <div className="text-xl font-bold text-amber-300">$249</div>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <Link href="/courses/pebble-beach">
                  <Button size="sm" className="bg-amber-400 text-slate-900">Reserve</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" size="sm" className="border-slate-600 text-slate-200">Join & save</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-linear-to-b from-slate-900 to-slate-800 rounded-xl p-6 shadow-lg ring-1 ring-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-emerald-600/10 text-emerald-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" fill="currentColor"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Book premium courses</h3>
                <p className="text-sm text-slate-400 mt-1">Curated tee-times at world-renowned clubs with VIP access and flexible options.</p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-b from-slate-900 to-slate-800 rounded-xl p-6 shadow-lg ring-1 ring-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-amber-600/10 text-amber-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.5"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Earn rewards points</h3>
                <p className="text-sm text-slate-400 mt-1">Every booking & purchase nets points you can redeem for exclusive experiences.</p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-b from-slate-900 to-slate-800 rounded-xl p-6 shadow-lg ring-1 ring-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded bg-sky-600/10 text-sky-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="currentColor"/></svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Exclusive member perks</h3>
                <p className="text-sm text-slate-400 mt-1">Priority tee times, pro-shop credits, event invites, and more for members.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP PLANS */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold">Membership plans</h2>
          <p className="text-slate-400 mt-2">Choose the membership that fits your game — upgrade anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-slate-900 rounded-xl p-6 border border-white/5 shadow-sm">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="text-sm text-slate-400 mt-1">No monthly cost • Basic rewards</p>
              </div>
              <div className="text-2xl font-bold text-slate-100">$0</div>
            </div>

            <ul className="mt-6 space-y-3 text-slate-300 text-sm">
        <li>Browse public courses</li>
        <li>Standard member support</li>
            </ul>

            <div className="mt-6">
              <Link href="/signup">
                <Button className="w-full bg-emerald-400 text-slate-900">Get started — it's free</Button>
              </Link>
            </div>
          </div>

          {/* Gold */}
          <div className="bg-linear-to-tr from-slate-900 to-slate-800 rounded-2xl p-6 ring-1 ring-amber-400/10 shadow-xl border border-amber-300/5">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="text-xl font-semibold">Gold</h3>
                <p className="text-sm text-slate-300 mt-1">Most popular • Enhanced rewards</p>
              </div>
              <div className="text-2xl font-bold text-amber-300">$19 / mo</div>
            </div>

            <ul className="mt-6 space-y-3 text-slate-200 text-sm">
              <li>Priority booking window</li>
              <li>5% pro-shop credit back</li>
              <li>Access to members-only events</li>
            </ul>

            <div className="mt-6">
              <Link href="/signup">
                <Button className="w-full bg-amber-300 text-slate-900">Join Gold</Button>
              </Link>
            </div>
          </div>

          {/* Platinum */}
          <div className="bg-linear-to-b from-slate-900 to-slate-800 rounded-xl p-6 border border-emerald-700/10 shadow-lg">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="text-xl font-semibold">Platinum</h3>
                <p className="text-sm text-slate-300 mt-1">For the avid golfer • VIP access</p>
              </div>
              <div className="text-2xl font-bold text-emerald-300">$49 / mo</div>
            </div>

            <ul className="mt-6 space-y-3 text-slate-200 text-sm">
              <li>Guaranteed premium tee-times</li>
              <li>15% pro-shop credit back</li>
              <li>Complimentary guest passes</li>
            </ul>

            <div className="mt-6">
              <Link href="/signup">
                <Button className="w-full bg-emerald-400 text-slate-900">Join Platinum</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold">What members love</h2>
          <p className="text-slate-400 mt-2">Real stories from our members and partners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <blockquote className="bg-slate-900 p-6 rounded-xl shadow ring-1 ring-white/5">
            <p className="text-slate-200">“Booked Pebble Beach in minutes — the VIP handling made the day unforgettable. Points earned paid for my next tee time.”</p>
            <footer className="mt-4 text-sm text-slate-400">— Daniel R., Platinum member</footer>
          </blockquote>

          <blockquote className="bg-slate-900 p-6 rounded-xl shadow ring-1 ring-white/5">
            <p className="text-slate-200">“The rewards program is elegantly designed and actually valuable. I redeemed points for a caddie experience.”</p>
            <footer className="mt-4 text-sm text-slate-400">— Priya S., Gold member</footer>
          </blockquote>

          <blockquote className="bg-slate-900 p-6 rounded-xl shadow ring-1 ring-white/5">
            <p className="text-slate-200">“Our club’s tee-times filled reliably. The integration and support from Golf Rewards were top-notch.”</p>
            <footer className="mt-4 text-sm text-slate-400">— St. Andrews Club, Partner</footer>
          </blockquote>
        </div>
      </section>

      {/* FINAL CTA */}
  <section className="bg-linear-to-b from-[#03120f] to-[#02100e] py-16">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <h2 className="text-3xl font-extrabold">Ready to elevate your game?</h2>
          <p className="text-slate-400 mt-4">Join hundreds of discerning golfers who trust Golf Rewards for premium access and unforgettable rounds.</p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-emerald-400 text-slate-900">Join Golf Rewards Today</Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="border-slate-600">Explore courses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 text-slate-400">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            © {new Date().getFullYear()} Golf Rewards — All rights reserved.
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

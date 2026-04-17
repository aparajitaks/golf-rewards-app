# Golf Rewards Charity Platform

Submission-ready **Next.js 16 (App Router)** + **TypeScript** + **Tailwind CSS 4** + **Supabase** (Auth, Postgres, Storage) + **Stripe** (subscriptions, portal, webhooks) + **Framer Motion** + **React Hook Form / Zod**.

**Live deployment:** `https://YOUR-VERCEL-URL.vercel.app` (replace after deploy)

---

## Project overview

A membership product where golfers maintain **five Stableford scores**, join **monthly draws**, and direct **charity contributions**. Includes a **member dashboard**, **admin portal** (draws, winners, charities, reports), and a **conversion-focused marketing site**.

---

## Tech stack

| Area        | Choice |
| ----------- | ------ |
| Framework   | Next.js 16 App Router |
| UI          | Tailwind 4, shadcn-style components, next-themes, sonner |
| Data / Auth | Supabase (RLS in `supabase/schema.sql`) |
| Payments    | Stripe Checkout + Customer Portal + webhooks |
| Forms       | React Hook Form + Zod |

---

## Features completed (demo scope)

- [x] Marketing homepage, pricing, concept, charity directory + profile pages  
- [x] Email/password auth, Google OAuth hook, forgot/reset password, PKCE callback  
- [x] Subscriber dashboard: overview, scores CRUD (premium-gated), draws, winnings (proof upload), charity settings, subscription  
- [x] Admin: users search, scores list, draws simulate/publish, charities CRUD, winner verification, reports  
- [x] Stripe checkout + billing portal API routes + subscription sync webhook (service role)  
- [x] Row Level Security + server actions for sensitive writes  

---

## Environment variables

Fill **`.env.example`** with your real keys locally (this repo loads it via `dotenv-cli` for `npm run dev` / `npm run start`). The committed file contains **placeholders only** — never commit secrets.

On **Vercel**, set the same variable names in Project → Settings → Environment Variables (do not rely on `.env.example` in production builds).

Variable reference:

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL (auth redirects, Stripe return URLs) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (browser + server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (prod) | **Server only** — Stripe webhook upserts subscriptions |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Yes (prod) | Webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | If you add client-side Stripe.js later |
| `STRIPE_PRICE_MONTHLY` | Yes | Recurring price id for monthly plan |
| `STRIPE_PRICE_YEARLY` | Yes | Recurring price id for yearly plan |

Public marketing pages **degrade gracefully** if Supabase env is missing (empty charity sections / copy instead of a crash).

---

## Setup (local / judge machine)

```bash
npm install
# Edit .env.example with your Supabase + Stripe values, then:
npm run dev
```

Optional: keep a private **`.env.local`** for overrides — Next.js still merges it on top when present.

1. **Supabase** → SQL Editor → run `supabase/schema.sql`, then `supabase/seed.sql` (three charities).  
2. **Storage** → create bucket `winner-proofs` (see schema README notes in repo history or Storage policies in Supabase docs).  
3. **Stripe** → products/prices → paste price IDs into `.env.example` (local) or Vercel env. Configure **Customer portal**.  
4. **Auth URLs** in Supabase → add `http://localhost:3000/auth/callback` and production callback + `/reset-password`.  
5. Run:

```bash
npm run dev
```

Quality gates:

```bash
npm run build
npm run lint
```

---

## Demo credentials & seed data

### Accounts (create in the app or Supabase Auth)

Use these **exact emails** so `supabase/demo-seed.sql` can attach data:

| Role   | Email                    | Password               |
| ------ | ------------------------ | ---------------------- |
| Member | `member@golfrewards.demo` | `SubmissionDemo2026!` |
| Admin  | `admin@golfrewards.demo`  | `SubmissionDemo2026!` |

After both exist, in **SQL Editor**:

```sql
update public.profiles set role = 'admin' where email = 'admin@golfrewards.demo';
```

Then run **`supabase/demo-seed.sql`** (same editor). It will:

- Promote `admin@…` to admin  
- Attach member to Fairway Futures charity  
- Insert **five realistic Stableford scores**  
- Create a **published “Judge Demo Draw”** with a **5-match win**, `draw_results`, `winners`, and a **notification** for the member  

**Admin walkthrough:** log in as admin → `/admin` → Users, Draws, Winners, Reports.  
**Member walkthrough:** log in as member → Dashboard → Scores / Draws / Winnings (proof upload).

---

## Stripe webhook (production)

Endpoint: `https://YOUR-DOMAIN/api/stripe/webhook`  

Events (minimum): `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.

Use `stripe listen --forward-to localhost:3000/api/stripe/webhook` locally.

---

## Deployment (Vercel)

1. Import repo → set **all** env vars (including `SUPABASE_SERVICE_ROLE_KEY`).  
2. Production **Supabase Auth** URL allowlist must include your Vercel domain + `/auth/callback`.  
3. Deploy → run SQL migrations on the **production** Supabase project before sharing the link.

**Note:** Next.js 16 may log that `middleware` is deprecated in favour of `proxy` — session refresh still works; migrate when you have time ([docs](https://nextjs.org/docs/messages/middleware-to-proxy)).

---

## Repo map

- `app/` — routes (marketing, `dashboard/*`, `admin/*`, `api/stripe/*`)  
- `app/actions/` — server actions (scores, draws, profile, admin)  
- `lib/` — Supabase factories, Stripe, draw engine, email placeholder  
- `supabase/schema.sql` — DDL + RLS  
- `supabase/seed.sql` — three charities  
- `supabase/demo-seed.sql` — judge-ready member scores + winning draw  

---

## Submission checklist (quick)

- [ ] `npm run build` / `npm run lint` green  
- [ ] Vercel env vars set (incl. service role + webhook secret)  
- [ ] Supabase Auth redirect URLs updated for prod domain  
- [ ] `schema.sql` + `seed.sql` + `demo-seed.sql` applied on prod DB  
- [ ] Stripe webhook live + test subscription once  
- [ ] Replace deployment placeholder URL at top of this README  

---

Built for evaluation: prioritize **stability**, **clear demo path**, and **documented setup** over speculative refactors.

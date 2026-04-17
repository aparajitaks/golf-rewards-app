# Golf Rewards Charity Platform

Startup-grade **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**, **shadcn-style UI**, **Supabase** (Auth + Postgres + Storage), **Stripe** subscriptions, **React Hook Form + Zod**, **Framer Motion**, and **Vercel-ready** deployment.

## 1. Project folder structure (high level)

```
app/
  page.tsx                 # Premium marketing homepage
  concept/                 # How it works
  charities/               # Directory + profile pages
  pricing/, checkout/
  login/, signup/, forgot-password/, reset-password/
  auth/callback/           # OAuth + PKCE code exchange
  dashboard/               # Subscriber shell + modules
  admin/                     # Admin portal (role-gated)
  api/stripe/                # Checkout, portal, webhooks
components/
  marketing/, dashboard/, admin/, ui/
lib/
  supabase/ (server, middleware, service), stripe, draw-engine, email, …
app/actions/               # Server Actions (scores, draws, profile, admin)
supabase/
  schema.sql                 # Tables, triggers, RLS
  seed.sql                   # Sample charities
```

## 2. Database schema

Run `supabase/schema.sql` in the Supabase SQL editor (or your migration workflow). It provisions:

`profiles`, `subscriptions`, `scores`, `charities`, `draws`, `draw_entries`, `draw_results`, `winners`, `payments`, `notifications`, `admin_logs`

— with foreign keys, indexes, an `auth.users` → `profiles` trigger, RLS policies, and a **before insert** guard for **max five scores per user**.

Optional seed: `supabase/seed.sql`.

### Storage (winner proofs)

1. Create a **public** or **authenticated** bucket named `winner-proofs` in Supabase Storage.
2. Add policies so members can upload to `winner-proofs/{user_id}/...` and admins can read all objects (tighten paths in production).

## 3. Setup commands

```bash
npm install
cp .env.example .env.local
# Fill NEXT_PUBLIC_SUPABASE_* , STRIPE_* , SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL
```

Apply SQL, then seed charities:

```bash
# In Supabase SQL editor: paste supabase/schema.sql, then optionally supabase/seed.sql
```

Promote your user to admin (replace email):

```sql
update public.profiles set role = 'admin' where email = 'you@company.com';
```

Run the app:

```bash
npm run dev
```

## 4. Core implementation notes

- **Auth**: `@supabase/ssr` browser client + `middleware.ts` session refresh (`getAll` / `setAll` cookies). Server data uses `lib/supabase/server.ts`.
- **Roles**: `profiles.role` (`user` | `admin`). Middleware blocks `/admin` for non-admins; layouts call `requireAdmin()` again.
- **Subscriptions**: `lib/subscription.ts` treats `active` and `trialing` with a future `current_period_end` as premium. Webhook (`app/api/stripe/webhook/route.ts`) upserts `subscriptions` using the **service role** client (`lib/supabase/service.ts`).
- **Scores**: Server actions trim to five rounds, enforce Stableford **1–45**, unique dates, and premium gating (`app/actions/scores.ts`).
- **Draws**: `lib/draw-engine.ts` implements multiset matching, **random** vs **weighted** winning lines, and **40% / 35% / 25%** tier splits with jackpot carry for unallocated headline pools. Admin simulate + publish in `app/actions/draw-admin.ts`.
- **Charity**: Public directory with search/tags; signup and dashboard charity settings.
- **Email**: `lib/email.ts` is a **placeholder** (`sendEmail`) — swap for Resend/Postmark/SendGrid.
- **Rate limits**: `lib/rate-limit.ts` in-memory placeholder for sensitive actions.

## 5. Stripe

1. Create **Products** and recurring **Prices** (monthly + yearly).
2. Put price IDs in `.env.local` as `STRIPE_PRICE_MONTHLY` and `STRIPE_PRICE_YEARLY`.
3. Configure the **customer portal** in Stripe Dashboard.
4. Checkout session metadata includes `supabase_user_id`; subscription metadata is set for webhook upserts.

### Webhook guide

1. Stripe Dashboard → Developers → Webhooks → Add endpoint:  
   `https://<your-domain>/api/stripe/webhook`
2. Events (minimum): `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
3. Signing secret → `STRIPE_WEBHOOK_SECRET`.
4. Use the **live** secret in production; service role key only on the server.

Local testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 6. Vercel deployment

1. Connect the Git repo to Vercel; framework preset **Next.js**.
2. Set the same environment variables as `.env.example` in the Vercel project settings.
3. Add your production URL to **Supabase Auth → URL configuration** (redirect URLs include `/auth/callback`, `/reset-password`).
4. Deploy. Run SQL migrations against the production Supabase project before sending traffic.

## 7. Next.js 16 note (middleware → proxy)

Builds may log: *middleware file convention is deprecated — use proxy*. Follow the official Next.js 16 migration guide when you are ready to move session refresh + route guards from `middleware.ts` to the new `proxy` convention.

## 8. Scripts

| Command        | Purpose              |
| -------------- | -------------------- |
| `npm run dev`  | Local development    |
| `npm run build`| Production build     |
| `npm run start`| Start production app |
| `npm run lint` | ESLint               |

---

Built as a **single product codebase** — extend admin CRUD, wire real email, add analytics, and tighten Storage RLS as you harden for launch.

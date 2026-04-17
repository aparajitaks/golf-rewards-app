-- Golf Rewards Charity Platform — production schema
-- Run in Supabase SQL Editor or via supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- charities
-- ---------------------------------------------------------------------------
create table if not exists public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  mission text,
  website_url text,
  country text default 'UK',
  tags text[] default '{}',
  logo_url text,
  cover_image_url text,
  featured boolean not null default false,
  events jsonb default '[]'::jsonb,
  total_raised_cents bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists charities_featured_idx on public.charities (featured) where featured = true;
create index if not exists charities_tags_gin on public.charities using gin (tags);

-- ---------------------------------------------------------------------------
-- profiles (1:1 auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  charity_id uuid references public.charities (id) on delete set null,
  contribution_percent int not null default 10 check (contribution_percent between 10 and 100),
  independent_donation_opt_in boolean not null default false,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_charity_idx on public.profiles (charity_id);
create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- subscriptions (Stripe mirror)
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  price_id text,
  plan_interval text check (plan_interval in ('month', 'year')),
  status text not null default 'inactive'
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused', 'inactive')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions (user_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);

-- ---------------------------------------------------------------------------
-- scores (Stableford 1–45, max 5 per user enforced in app + trigger)
-- ---------------------------------------------------------------------------
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  score_date date not null,
  points int not null check (points between 1 and 45),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, score_date)
);

create index if not exists scores_user_date_idx on public.scores (user_id, score_date desc);

create or replace function public.enforce_max_five_scores_bi()
returns trigger
language plpgsql
as $$
declare c int;
begin
  select count(*) into c from public.scores where user_id = new.user_id;
  if c >= 5 then
    raise exception 'A maximum of 5 scores is allowed per user';
  end if;
  return new;
end;
$$;

drop trigger if exists scores_max_five_bi on public.scores;
create trigger scores_max_five_bi before insert on public.scores
for each row execute function public.enforce_max_five_scores_bi();

-- ---------------------------------------------------------------------------
-- draws
-- ---------------------------------------------------------------------------
create table if not exists public.draws (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  period_month date not null,
  mode text not null default 'random' check (mode in ('random', 'weighted')),
  status text not null default 'draft' check (status in ('draft', 'open', 'closed', 'simulated', 'published')),
  pool_cents bigint not null default 0,
  jackpot_carry_in_cents bigint not null default 0,
  jackpot_carry_out_cents bigint not null default 0,
  winning_scores int[] check (array_length(winning_scores, 1) is null or array_length(winning_scores, 1) = 5),
  simulation_result jsonb,
  published_at timestamptz,
  opens_at timestamptz,
  closes_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period_month)
);

create index if not exists draws_status_idx on public.draws (status);
create index if not exists draws_month_idx on public.draws (period_month desc);

-- ---------------------------------------------------------------------------
-- draw_entries (snapshot of user's 5 scores at entry time)
-- ---------------------------------------------------------------------------
create table if not exists public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  scores_snapshot int[] not null check (array_length(scores_snapshot, 1) = 5),
  created_at timestamptz not null default now(),
  unique (draw_id, user_id)
);

create index if not exists draw_entries_draw_idx on public.draw_entries (draw_id);

-- ---------------------------------------------------------------------------
-- draw_results (per user outcome after publish)
-- ---------------------------------------------------------------------------
create table if not exists public.draw_results (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_id uuid references public.draw_entries (id) on delete set null,
  match_count int not null check (match_count between 0 and 5),
  prize_tier text not null check (prize_tier in ('none', 'three', 'four', 'five')),
  prize_cents bigint not null default 0,
  proof_storage_path text,
  verification_status text not null default 'na'
    check (verification_status in ('na', 'pending', 'approved', 'rejected')),
  payout_status text not null default 'na'
    check (payout_status in ('na', 'pending', 'approved', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (draw_id, user_id)
);

create index if not exists draw_results_draw_idx on public.draw_results (draw_id);
create index if not exists draw_results_user_idx on public.draw_results (user_id);

-- ---------------------------------------------------------------------------
-- winners (materialized convenience; mirrors winning draw_results rows)
-- ---------------------------------------------------------------------------
create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  draw_result_id uuid not null references public.draw_results (id) on delete cascade,
  draw_id uuid not null references public.draws (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  prize_tier text not null check (prize_tier in ('three', 'four', 'five')),
  prize_cents bigint not null,
  proof_storage_path text,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'approved', 'rejected')),
  payout_status text not null default 'pending'
    check (payout_status in ('pending', 'approved', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (draw_id, user_id)
);

create index if not exists winners_draw_idx on public.winners (draw_id);
create index if not exists winners_user_idx on public.winners (user_id);

-- ---------------------------------------------------------------------------
-- payments (ledger / Stripe invoices)
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  stripe_invoice_id text unique,
  stripe_payment_intent_id text,
  amount_cents bigint not null,
  currency text not null default 'gbp',
  status text not null,
  type text not null default 'subscription' check (type in ('subscription', 'donation', 'payout', 'other')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists payments_user_idx on public.payments (user_id);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx on public.notifications (user_id) where read_at is null;

-- ---------------------------------------------------------------------------
-- admin_logs
-- ---------------------------------------------------------------------------
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_logs_admin_idx on public.admin_logs (admin_id);
create index if not exists admin_logs_created_idx on public.admin_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated on public.profiles;
create trigger set_profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_charities_updated on public.charities;
create trigger set_charities_updated before update on public.charities
for each row execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated on public.subscriptions;
create trigger set_subscriptions_updated before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_scores_updated on public.scores;
create trigger set_scores_updated before update on public.scores
for each row execute function public.set_updated_at();

drop trigger if exists set_draws_updated on public.draws;
create trigger set_draws_updated before update on public.draws
for each row execute function public.set_updated_at();

drop trigger if exists set_draw_results_updated on public.draw_results;
create trigger set_draw_results_updated before update on public.draw_results
for each row execute function public.set_updated_at();

drop trigger if exists set_winners_updated on public.winners;
create trigger set_winners_updated before update on public.winners
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth: profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.charities enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.draw_entries enable row level security;
alter table public.draw_results enable row level security;
alter table public.winners enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_logs enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.role = 'admin'
  );
$$;

-- charities: public read, admin write
drop policy if exists charities_select_all on public.charities;
create policy charities_select_all on public.charities for select using (true);

drop policy if exists charities_admin_all on public.charities;
create policy charities_admin_all on public.charities for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select
using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
using (id = auth.uid() or public.is_admin(auth.uid()))
with check (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert
with check (id = auth.uid() or public.is_admin(auth.uid()));

-- subscriptions
drop policy if exists subscriptions_select on public.subscriptions;
create policy subscriptions_select on public.subscriptions for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists subscriptions_admin_write on public.subscriptions;
create policy subscriptions_admin_write on public.subscriptions for insert
with check (public.is_admin(auth.uid()));

drop policy if exists subscriptions_service on public.subscriptions;
create policy subscriptions_service on public.subscriptions for update
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

-- scores
drop policy if exists scores_select_own on public.scores;
create policy scores_select_own on public.scores for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists scores_mutate_own on public.scores;
create policy scores_mutate_own on public.scores for insert
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists scores_update_own on public.scores;
create policy scores_update_own on public.scores for update
using (user_id = auth.uid() or public.is_admin(auth.uid()))
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists scores_delete_own on public.scores;
create policy scores_delete_own on public.scores for delete
using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- draws: published visible to all; full access admin
drop policy if exists draws_select on public.draws;
create policy draws_select on public.draws for select
using (
  status = 'published'
  or public.is_admin(auth.uid())
  or (status in ('open', 'closed') and auth.uid() is not null)
);

drop policy if exists draws_admin_write on public.draws;
create policy draws_admin_write on public.draws for insert
with check (public.is_admin(auth.uid()));

drop policy if exists draws_admin_update on public.draws;
create policy draws_admin_update on public.draws for update
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- draw_entries
drop policy if exists draw_entries_select on public.draw_entries;
create policy draw_entries_select on public.draw_entries for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists draw_entries_insert on public.draw_entries;
create policy draw_entries_insert on public.draw_entries for insert
with check (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists draw_entries_delete on public.draw_entries;
create policy draw_entries_delete on public.draw_entries for delete
using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- draw_results
drop policy if exists draw_results_select on public.draw_results;
create policy draw_results_select on public.draw_results for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists draw_results_admin on public.draw_results;
create policy draw_results_admin on public.draw_results for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- winners
drop policy if exists winners_select on public.winners;
create policy winners_select on public.winners for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists winners_update_own_proof on public.winners;
create policy winners_update_own_proof on public.winners for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists winners_admin on public.winners;
create policy winners_admin on public.winners for all
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- payments
drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select
using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists payments_admin on public.payments;
create policy payments_admin on public.payments for insert
with check (public.is_admin(auth.uid()));

-- notifications
drop policy if exists notifications_own on public.notifications;
create policy notifications_own on public.notifications for select using (user_id = auth.uid());
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications for update using (user_id = auth.uid());
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications for insert with check (public.is_admin(auth.uid()));

-- admin_logs
drop policy if exists admin_logs_admin on public.admin_logs;
create policy admin_logs_admin on public.admin_logs for select using (public.is_admin(auth.uid()));
drop policy if exists admin_logs_insert on public.admin_logs;
create policy admin_logs_insert on public.admin_logs for insert with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- Storage buckets (create in Dashboard UI; policies below are reference)
-- ---------------------------------------------------------------------------
-- Bucket: charity-assets (public read)
-- Bucket: winner-proofs (authenticated upload own folder userId/...)

comment on table public.charities is 'Partner charities for user-directed contributions';
comment on table public.draw_results is 'Per-user draw outcome; proof + payout for winners';
comment on table public.winners is 'Winning rows for verification workflow';

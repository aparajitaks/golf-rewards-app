-- =============================================================================
-- REVIEWER DEMO DATA (run AFTER schema.sql + seed.sql)
-- =============================================================================
-- 1) In the app: Sign up TWO accounts (or use Supabase Auth UI):
--      Member:  member@golfrewards.demo  /  SubmissionDemo2026!
--      Admin:   admin@golfrewards.demo   /  SubmissionDemo2026!
-- 2) Promote admin (SQL below).
-- 3) Run this entire script in Supabase SQL Editor.
-- =============================================================================

update public.profiles
set role = 'admin'
where email = 'admin@golfrewards.demo';

-- Link member to a charity + contribution (optional polish)
update public.profiles
set charity_id = (select id from public.charities where slug = 'fairway-futures-foundation' limit 1),
    contribution_percent = 15
where email = 'member@golfrewards.demo';

-- Five Stableford scores for member (unique dates)
insert into public.scores (user_id, score_date, points)
select p.id, d.dt, d.pts
from public.profiles p
cross join (
  values
    ('2026-03-08'::date, 36),
    ('2026-03-15'::date, 38),
    ('2026-03-22'::date, 34),
    ('2026-03-29'::date, 40),
    ('2026-04-05'::date, 37)
) as d(dt, pts)
where p.email = 'member@golfrewards.demo'
on conflict (user_id, score_date) do update set points = excluded.points;

-- Remove prior demo draw chain (safe re-run)
delete from public.winners
where draw_id in (select id from public.draws where title = 'Judge Demo Draw');

delete from public.draw_results
where draw_id in (select id from public.draws where title = 'Judge Demo Draw');

delete from public.draw_entries
where draw_id in (select id from public.draws where title = 'Judge Demo Draw');

delete from public.draws
where title = 'Judge Demo Draw';

-- Published draw + winning line (matches member ticket below for 5-of-5 demo)
with member as (
  select id from public.profiles where email = 'member@golfrewards.demo' limit 1
),
draw_row as (
  insert into public.draws (title, period_month, mode, status, pool_cents, jackpot_carry_in_cents, jackpot_carry_out_cents, winning_scores, published_at)
  select 'Judge Demo Draw', '2026-05-01', 'random', 'published', 250000, 0, 0, array[12, 18, 25, 33, 40]::int[], now()
  from member
  where exists (select 1 from member)
  returning id
),
entry_row as (
  insert into public.draw_entries (draw_id, user_id, scores_snapshot)
  select draw_row.id, member.id, array[12, 18, 25, 33, 40]::int[]
  from draw_row, member
  returning id, draw_id, user_id
),
result_row as (
  insert into public.draw_results (draw_id, user_id, entry_id, match_count, prize_tier, prize_cents, verification_status, payout_status)
  select entry_row.draw_id, entry_row.user_id, entry_row.id, 5, 'five', 100000, 'pending', 'pending'
  from entry_row
  returning id, draw_id, user_id, prize_cents, prize_tier
)
insert into public.winners (draw_result_id, draw_id, user_id, prize_tier, prize_cents, verification_status, payout_status)
select result_row.id, result_row.draw_id, result_row.user_id, 'five', result_row.prize_cents, 'pending', 'pending'
from result_row;

-- Optional: in-app notification for member
insert into public.notifications (user_id, type, title, body)
select id, 'winner', 'Demo win — upload proof', 'This is seeded demo data for judges. Visit Winnings to try proof upload.'
from public.profiles
where email = 'member@golfrewards.demo'
  and not exists (
    select 1 from public.notifications n
    where n.user_id = profiles.id and n.title = 'Demo win — upload proof'
  );

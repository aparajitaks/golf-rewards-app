-- Three featured charities for demos / judging (idempotent)
insert into public.charities (name, slug, short_description, description, mission, website_url, country, tags, featured, events)
values
(
  'Fairway Futures Foundation',
  'fairway-futures-foundation',
  'Youth development through sport and mentorship.',
  'Fairway Futures invests in young people from underserved communities, funding coaching, equipment, and academic support.',
  'Every child deserves a fair shot — on the course and in life.',
  'https://example.org/fairway-futures',
  'UK',
  array['youth', 'education', 'sport'],
  true,
  '[{"title":"Spring Classic Gala","date":"2026-05-14","description":"Annual fundraising dinner."}]'::jsonb
),
(
  'GreenLinks Conservation',
  'greenlinks-conservation',
  'Protecting habitats near historic courses.',
  'GreenLinks partners with local trusts to restore wetlands and woodlands adjacent to public golf lands.',
  'Preserve wild spaces for the next generation of players and wildlife.',
  'https://example.org/greenlinks',
  'UK',
  array['environment', 'wildlife'],
  true,
  '[{"title":"Coastal Clean-up Day","date":"2026-06-08","description":"Volunteer shoreline restoration."}]'::jsonb
),
(
  'Quiet Mind Mental Health',
  'quiet-mind-mental-health',
  'Accessible counselling for athletes and veterans.',
  'Quiet Mind subsidises therapy sessions and runs peer support circles focused on performance anxiety and life transitions.',
  'Calm minds, stronger communities.',
  'https://example.org/quiet-mind',
  'UK',
  array['mental health', 'wellbeing'],
  true,
  '[]'::jsonb
)
on conflict (slug) do nothing;

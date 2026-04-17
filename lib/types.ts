export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  charity_id: string | null;
  contribution_percent: number;
  independent_donation_opt_in: boolean;
  stripe_customer_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  price_id: string | null;
  plan_interval: "month" | "year" | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
};

export type Charity = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  mission: string | null;
  website_url: string | null;
  country: string | null;
  tags: string[] | null;
  logo_url: string | null;
  cover_image_url: string | null;
  featured: boolean;
  events: unknown;
  total_raised_cents: number;
};

export type ScoreRow = {
  id: string;
  user_id: string;
  score_date: string;
  points: number;
};

export type DrawRow = {
  id: string;
  title: string;
  period_month: string;
  mode: "random" | "weighted";
  status: string;
  pool_cents: number;
  jackpot_carry_in_cents: number;
  jackpot_carry_out_cents: number;
  winning_scores: number[] | null;
  simulation_result: unknown;
  published_at: string | null;
  opens_at: string | null;
  closes_at: string | null;
};

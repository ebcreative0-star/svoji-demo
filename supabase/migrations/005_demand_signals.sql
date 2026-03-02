-- Demand signals table for vendor search intent tracking
-- Used to build marketplace and match couples with vendors

create table if not exists demand_signals (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references couples(id) on delete cascade,
  category text not null, -- fotograf, catering, misto, dj, kvetiny, etc.
  region text, -- geographic region if mentioned
  budget_hint int, -- budget hint if mentioned
  urgency text check (urgency in ('low', 'medium', 'high')), -- urgency level
  raw_message text not null, -- original user message
  created_at timestamptz not null default now()
);

-- Index for querying by category and region
create index if not exists idx_demand_signals_category on demand_signals(category);
create index if not exists idx_demand_signals_region on demand_signals(region) where region is not null;
create index if not exists idx_demand_signals_created_at on demand_signals(created_at desc);

-- Index for couple lookup
create index if not exists idx_demand_signals_couple_id on demand_signals(couple_id);

-- RLS policies
alter table demand_signals enable row level security;

-- Couples can only see their own demand signals
create policy "Users can view own demand signals"
  on demand_signals for select
  using (auth.uid() = couple_id);

-- Couples can create demand signals
create policy "Users can create own demand signals"
  on demand_signals for insert
  with check (auth.uid() = couple_id);

-- Only system can update/delete (for now)
-- No update/delete policies for regular users

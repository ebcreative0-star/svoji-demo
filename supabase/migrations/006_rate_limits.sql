-- Rate limiting for chat messages
-- Limit: 50 messages per day per couple (midnight reset in Europe/Prague timezone)

create table chat_rate_limits (
  couple_id uuid primary key references couples(id) on delete cascade,
  message_count int default 0,
  window_start timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add RLS policies
alter table chat_rate_limits enable row level security;

-- Users can only view and update their own rate limit
create policy "Users can view own rate limit"
  on chat_rate_limits for select
  using (auth.uid() = couple_id);

create policy "Users can update own rate limit"
  on chat_rate_limits for update
  using (auth.uid() = couple_id);

-- System can insert new rate limits
create policy "System can insert rate limits"
  on chat_rate_limits for insert
  with check (true);

-- Atomic increment function
-- Returns the new count and whether this is a new window (after midnight reset)
create or replace function increment_chat_count(p_couple_id uuid)
returns table(new_count int, is_new_window boolean) as $$
declare
  v_window_start timestamptz;
  v_now timestamptz := now() at time zone 'Europe/Prague';
  v_today_start timestamptz := date_trunc('day', v_now);
begin
  -- Upsert and check window
  insert into chat_rate_limits (couple_id, message_count, window_start)
  values (p_couple_id, 1, v_today_start)
  on conflict (couple_id) do update set
    message_count = case
      when chat_rate_limits.window_start < v_today_start
      then 1
      else chat_rate_limits.message_count + 1
    end,
    window_start = case
      when chat_rate_limits.window_start < v_today_start
      then v_today_start
      else chat_rate_limits.window_start
    end,
    updated_at = now()
  returning message_count, window_start < v_today_start into new_count, is_new_window;

  return next;
end;
$$ language plpgsql security definer;

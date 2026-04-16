-- Add scheduling columns to habits
alter table habits
  add column if not exists scheduled_time    time,
  add column if not exists duration_minutes  int default 30;

-- Add scheduling columns to tasks
alter table tasks
  add column if not exists scheduled_time    time,
  add column if not exists duration_minutes  int default 30,
  add column if not exists due_date          date;

-- Daily overrides table (drag-and-drop repositions for one day)
create table if not exists schedule_overrides (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  item_type        text not null check (item_type in ('habit', 'task')),
  item_id          uuid not null,
  override_date    date not null,
  start_time       time not null,
  duration_minutes int  not null default 30,
  created_at       timestamptz not null default now(),
  unique (user_id, item_type, item_id, override_date)
);

alter table schedule_overrides enable row level security;
create policy "users manage own schedule_overrides"
  on schedule_overrides for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Make it So — Initial Schema
-- Apply via: Supabase dashboard → SQL Editor, or supabase db push
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text not null default '',
  category    text not null default '',
  color       text not null default '#2D6A4F',
  priority    int  not null default 3 check (priority between 1 and 5),
  goal_type   text not null default 'habit' check (goal_type in ('habit', 'project')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists habits (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  goal_id             uuid not null references goals(id) on delete cascade,
  title               text not null,
  description         text not null default '',
  frequency           text not null default 'daily' check (frequency in ('daily')),
  priority            int  not null default 3 check (priority between 1 and 5),
  active_streak       int  not null default 0,
  longest_streak      int  not null default 0,
  last_completed_date date,
  -- Progressive target tracking
  target_value        numeric,
  target_unit         text,
  current_target      numeric,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists habit_logs (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  habit_id       uuid not null references habits(id) on delete cascade,
  completed_date date not null,
  note           text,
  created_at     timestamptz not null default now(),
  unique (habit_id, completed_date)
);

create table if not exists projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  goal_id     uuid not null references goals(id) on delete cascade,
  title       text not null,
  description text not null default '',
  task_order  text not null default 'any' check (task_order in ('sequential', 'any')),
  status      text not null default 'active' check (status in ('active', 'completed', 'on_hold')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists tasks (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  project_id   uuid not null references projects(id) on delete cascade,
  title        text not null,
  description  text not null default '',
  status       text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  order_index  int  not null default 0,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists goals_user_id_idx        on goals(user_id);
create index if not exists habits_user_id_idx       on habits(user_id);
create index if not exists habits_goal_id_idx       on habits(goal_id);
create index if not exists habit_logs_user_id_idx   on habit_logs(user_id);
create index if not exists habit_logs_habit_date_idx on habit_logs(habit_id, completed_date);
create index if not exists projects_user_id_idx     on projects(user_id);
create index if not exists projects_goal_id_idx     on projects(goal_id);
create index if not exists tasks_user_id_idx        on tasks(user_id);
create index if not exists tasks_project_id_idx     on tasks(project_id);
create index if not exists tasks_order_idx          on tasks(project_id, order_index);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table goals       enable row level security;
alter table habits      enable row level security;
alter table habit_logs  enable row level security;
alter table projects    enable row level security;
alter table tasks       enable row level security;

-- goals
create policy "users manage own goals"
  on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- habits
create policy "users manage own habits"
  on habits for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- habit_logs
create policy "users manage own habit_logs"
  on habit_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- projects
create policy "users manage own projects"
  on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- tasks
create policy "users manage own tasks"
  on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- RPC: mark_habit_done
-- Inserts a habit_log row for the given date (idempotent),
-- then recalculates active_streak and longest_streak.
-- ============================================================

create or replace function mark_habit_done(
  p_user_id  uuid,
  p_habit_id uuid,
  p_date     date
) returns void language plpgsql security definer as $$
declare
  v_streak        int := 0;
  v_longest       int;
  v_check_date    date;
begin
  -- Upsert the log (ignore duplicate on same day)
  insert into habit_logs (user_id, habit_id, completed_date)
  values (p_user_id, p_habit_id, p_date)
  on conflict (habit_id, completed_date) do nothing;

  -- Recalculate active streak: walk backwards from p_date
  v_check_date := p_date;
  loop
    exit when not exists (
      select 1 from habit_logs
      where habit_id = p_habit_id and completed_date = v_check_date
    );
    v_streak     := v_streak + 1;
    v_check_date := v_check_date - interval '1 day';
  end loop;

  -- Get current longest streak
  select longest_streak into v_longest from habits where id = p_habit_id;

  update habits
  set
    active_streak       = v_streak,
    longest_streak      = greatest(v_longest, v_streak),
    last_completed_date = p_date,
    updated_at          = now()
  where id = p_habit_id;
end;
$$;

-- ============================================================
-- RPC: undo_habit_done
-- Removes the habit_log row for the given date, then
-- recalculates active_streak (longest_streak unchanged).
-- ============================================================

create or replace function undo_habit_done(
  p_user_id  uuid,
  p_habit_id uuid,
  p_date     date
) returns void language plpgsql security definer as $$
declare
  v_streak        int := 0;
  v_check_date    date;
  v_last_done     date;
begin
  -- Remove the log
  delete from habit_logs
  where habit_id = p_habit_id and completed_date = p_date;

  -- Find new most-recent completed date
  select max(completed_date) into v_last_done
  from habit_logs where habit_id = p_habit_id;

  -- Recalculate active streak from the most-recent date backwards
  if v_last_done is not null then
    v_check_date := v_last_done;
    loop
      exit when not exists (
        select 1 from habit_logs
        where habit_id = p_habit_id and completed_date = v_check_date
      );
      v_streak     := v_streak + 1;
      v_check_date := v_check_date - interval '1 day';
    end loop;
  end if;

  update habits
  set
    active_streak       = v_streak,
    last_completed_date = v_last_done,
    updated_at          = now()
  where id = p_habit_id;
end;
$$;

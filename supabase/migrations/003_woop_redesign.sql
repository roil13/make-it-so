-- ============================================================
-- Make it So — WOOP Redesign Migration
-- Drops the old habits/tasks/projects/schedule system and
-- replaces it with the science-backed WOOP goal model.
-- ============================================================

-- Drop old tables (cascades handle FK dependencies)
drop table if exists schedule_overrides cascade;
drop table if exists habit_logs cascade;
drop table if exists habits cascade;
drop table if exists tasks cascade;
drop table if exists projects cascade;

-- Extend goals table with WOOP fields
alter table goals add column if not exists why           text not null default '';
alter table goals add column if not exists best_outcome  text not null default '';
alter table goals add column if not exists motivation_charter text;

-- Remove old goal_type constraint (no longer needed)
alter table goals drop column if exists goal_type;

-- ============================================================
-- Obstacles (top obstacles per goal)
-- ============================================================
create table if not exists obstacles (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  goal_id      uuid not null references goals(id) on delete cascade,
  description  text not null,
  order_index  int not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists obstacles_goal_id_idx on obstacles(goal_id);
create index if not exists obstacles_user_id_idx on obstacles(user_id);

alter table obstacles enable row level security;
create policy "users manage own obstacles"
  on obstacles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- If-Then Plans (contingency plans linked to obstacles)
-- ============================================================
create table if not exists if_then_plans (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  obstacle_id       uuid not null references obstacles(id) on delete cascade,
  goal_id           uuid not null references goals(id) on delete cascade,
  trigger_condition text not null,
  action_plan       text not null,
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists if_then_plans_goal_id_idx     on if_then_plans(goal_id);
create index if not exists if_then_plans_obstacle_id_idx on if_then_plans(obstacle_id);
create index if not exists if_then_plans_user_id_idx     on if_then_plans(user_id);

alter table if_then_plans enable row level security;
create policy "users manage own if_then_plans"
  on if_then_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Micro-Steps (daily actions that replace habits)
-- ============================================================
create table if not exists micro_steps (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  goal_id             uuid not null references goals(id) on delete cascade,
  title               text not null,
  description         text not null default '',
  active_streak       int not null default 0,
  longest_streak      int not null default 0,
  last_completed_date date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists micro_steps_goal_id_idx  on micro_steps(goal_id);
create index if not exists micro_steps_user_id_idx  on micro_steps(user_id);

alter table micro_steps enable row level security;
create policy "users manage own micro_steps"
  on micro_steps for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Micro-Step Logs (daily completion records)
-- ============================================================
create table if not exists micro_step_logs (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  micro_step_id    uuid not null references micro_steps(id) on delete cascade,
  completed_date   date not null,
  note             text,
  created_at       timestamptz not null default now(),
  unique (micro_step_id, completed_date)
);

create index if not exists micro_step_logs_user_id_idx   on micro_step_logs(user_id);
create index if not exists micro_step_logs_step_date_idx on micro_step_logs(micro_step_id, completed_date);

alter table micro_step_logs enable row level security;
create policy "users manage own micro_step_logs"
  on micro_step_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Journal Entries (daily small wins)
-- ============================================================
create table if not exists journal_entries (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  entry_date   date not null,
  content      text not null,
  created_at   timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists journal_entries_user_id_idx   on journal_entries(user_id);
create index if not exists journal_entries_date_idx      on journal_entries(user_id, entry_date);

alter table journal_entries enable row level security;
create policy "users manage own journal_entries"
  on journal_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- RPC: mark_micro_step_done
-- Inserts a micro_step_log row for the given date (idempotent),
-- then recalculates active_streak and longest_streak.
-- ============================================================
create or replace function mark_micro_step_done(
  p_user_id  uuid,
  p_step_id  uuid,
  p_date     date
) returns void language plpgsql security definer as $$
declare
  v_streak        int := 0;
  v_longest       int;
  v_check_date    date;
begin
  insert into micro_step_logs (user_id, micro_step_id, completed_date)
  values (p_user_id, p_step_id, p_date)
  on conflict (micro_step_id, completed_date) do nothing;

  v_check_date := p_date;
  loop
    exit when not exists (
      select 1 from micro_step_logs
      where micro_step_id = p_step_id and completed_date = v_check_date
    );
    v_streak     := v_streak + 1;
    v_check_date := v_check_date - interval '1 day';
  end loop;

  select longest_streak into v_longest from micro_steps where id = p_step_id;

  update micro_steps
  set
    active_streak       = v_streak,
    longest_streak      = greatest(v_longest, v_streak),
    last_completed_date = p_date,
    updated_at          = now()
  where id = p_step_id;
end;
$$;

-- ============================================================
-- RPC: undo_micro_step_done
-- ============================================================
create or replace function undo_micro_step_done(
  p_user_id  uuid,
  p_step_id  uuid,
  p_date     date
) returns void language plpgsql security definer as $$
declare
  v_streak        int := 0;
  v_check_date    date;
  v_last_done     date;
begin
  delete from micro_step_logs
  where micro_step_id = p_step_id and completed_date = p_date;

  select max(completed_date) into v_last_done
  from micro_step_logs where micro_step_id = p_step_id;

  if v_last_done is not null then
    v_check_date := v_last_done;
    loop
      exit when not exists (
        select 1 from micro_step_logs
        where micro_step_id = p_step_id and completed_date = v_check_date
      );
      v_streak     := v_streak + 1;
      v_check_date := v_check_date - interval '1 day';
    end loop;
  end if;

  update micro_steps
  set
    active_streak       = v_streak,
    last_completed_date = v_last_done,
    updated_at          = now()
  where id = p_step_id;
end;
$$;

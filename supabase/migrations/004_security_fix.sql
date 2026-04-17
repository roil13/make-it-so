-- ============================================================
-- Migration 004: Security fix — harden SECURITY DEFINER RPCs
--
-- Problem: mark_habit_done, undo_habit_done, mark_micro_step_done,
-- and undo_micro_step_done accepted p_user_id as a client-supplied
-- parameter but never validated it equals auth.uid(). Because these
-- functions run with SECURITY DEFINER (elevated privileges), RLS
-- policies on the underlying tables do NOT apply inside the function
-- body. A malicious authenticated user who knew another user's UUID
-- could corrupt that user's streaks and logs.
--
-- Fix: Derive the caller's identity from auth.uid() inside the
-- function, validate ownership before any write, and remove p_user_id
-- from the public signature so clients cannot supply it.
-- ============================================================

-- ============================================================
-- mark_micro_step_done (replaces 003_woop_redesign.sql version)
-- ============================================================
create or replace function mark_micro_step_done(
  p_step_id  uuid,
  p_date     date
) returns void language plpgsql security definer as $$
declare
  v_user_id    uuid := auth.uid();
  v_streak     int  := 0;
  v_longest    int;
  v_check_date date;
begin
  -- Auth guard
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  -- Ownership guard: step must belong to the caller
  if not exists (
    select 1 from micro_steps where id = p_step_id and user_id = v_user_id
  ) then
    raise exception 'Not found';
  end if;

  insert into micro_step_logs (user_id, micro_step_id, completed_date)
  values (v_user_id, p_step_id, p_date)
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
-- undo_micro_step_done (replaces 003_woop_redesign.sql version)
-- ============================================================
create or replace function undo_micro_step_done(
  p_step_id  uuid,
  p_date     date
) returns void language plpgsql security definer as $$
declare
  v_user_id    uuid := auth.uid();
  v_streak     int  := 0;
  v_check_date date;
  v_last_done  date;
begin
  -- Auth guard
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  -- Ownership guard
  if not exists (
    select 1 from micro_steps where id = p_step_id and user_id = v_user_id
  ) then
    raise exception 'Not found';
  end if;

  delete from micro_step_logs
  where micro_step_id = p_step_id
    and completed_date = p_date
    and user_id = v_user_id;

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

-- ============================================================
-- mark_habit_done (replaces 001_initial_schema.sql version)
-- ============================================================
create or replace function mark_habit_done(
  p_habit_id uuid,
  p_date     date
) returns void language plpgsql security definer as $$
declare
  v_user_id    uuid := auth.uid();
  v_streak     int  := 0;
  v_longest    int;
  v_check_date date;
begin
  -- Auth guard
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  -- Ownership guard
  if not exists (
    select 1 from habits where id = p_habit_id and user_id = v_user_id
  ) then
    raise exception 'Not found';
  end if;

  insert into habit_logs (user_id, habit_id, completed_date)
  values (v_user_id, p_habit_id, p_date)
  on conflict (habit_id, completed_date) do nothing;

  v_check_date := p_date;
  loop
    exit when not exists (
      select 1 from habit_logs
      where habit_id = p_habit_id and completed_date = v_check_date
    );
    v_streak     := v_streak + 1;
    v_check_date := v_check_date - interval '1 day';
  end loop;

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
-- undo_habit_done (replaces 001_initial_schema.sql version)
-- ============================================================
create or replace function undo_habit_done(
  p_habit_id uuid,
  p_date     date
) returns void language plpgsql security definer as $$
declare
  v_user_id    uuid := auth.uid();
  v_streak     int  := 0;
  v_check_date date;
  v_last_done  date;
begin
  -- Auth guard
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  -- Ownership guard
  if not exists (
    select 1 from habits where id = p_habit_id and user_id = v_user_id
  ) then
    raise exception 'Not found';
  end if;

  delete from habit_logs
  where habit_id = p_habit_id
    and completed_date = p_date
    and user_id = v_user_id;

  select max(completed_date) into v_last_done
  from habit_logs where habit_id = p_habit_id;

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

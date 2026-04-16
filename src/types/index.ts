export interface Goal {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  color: string
  priority: number // 1-5
  goal_type: 'habit' | 'project'
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  goal_id: string
  title: string
  description: string
  frequency: 'daily'
  priority: number // 1-5
  active_streak: number
  longest_streak: number
  last_completed_date: string | null // ISO date "2026-04-14"
  target_value: number | null
  target_unit: string | null
  current_target: number | null
  scheduled_time: string | null    // "HH:MM:SS"
  duration_minutes: number | null
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  user_id: string
  habit_id: string
  completed_date: string // ISO date
  note: string | null
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  goal_id: string
  title: string
  description: string
  task_order: 'sequential' | 'any'
  status: 'active' | 'completed' | 'on_hold'
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  project_id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  order_index: number
  completed_at: string | null
  scheduled_time: string | null    // "HH:MM:SS"
  duration_minutes: number | null
  due_date: string | null          // ISO date
  created_at: string
  updated_at: string
}

export interface ScheduleOverride {
  id: string
  user_id: string
  item_type: 'habit' | 'task'
  item_id: string
  override_date: string  // ISO date
  start_time: string     // "HH:MM:SS"
  duration_minutes: number
  created_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  start: string   // ISO datetime
  end: string     // ISO datetime
  provider: 'google' | 'microsoft'
  color: string
}

// Derived type used in scoring
export interface ScoredHabit extends Habit {
  score: number
  goal: Goal
}

export interface ScoredTask extends Task {
  score: number
  project: Project
  goal: Goal
}

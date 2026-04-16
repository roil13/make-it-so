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
  created_at: string
  updated_at: string
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

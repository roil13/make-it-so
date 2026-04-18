export interface Goal {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  color: string
  priority: number // 1-5
  why: string
  best_outcome: string
  motivation_charter: string | null
  created_at: string
  updated_at: string
}

export interface Obstacle {
  id: string
  user_id: string
  goal_id: string
  description: string
  order_index: number
  created_at: string
}

export interface IfThenPlan {
  id: string
  user_id: string
  obstacle_id: string
  goal_id: string
  trigger_condition: string
  action_plan: string
  active: boolean
  created_at: string
}

export interface MicroStep {
  id: string
  user_id: string
  goal_id: string
  title: string
  description: string
  active_streak: number
  longest_streak: number
  last_completed_date: string | null
  created_at: string
  updated_at: string
}

export interface MicroStepLog {
  id: string
  user_id: string
  micro_step_id: string
  completed_date: string
  note: string | null
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  content: string
  created_at: string
}

import { supabase } from '../supabase/client'
import type { Goal } from '../types'

type GoalInput = Pick<Goal, 'title' | 'description' | 'category' | 'color' | 'priority' | 'why' | 'best_outcome' | 'motivation_charter'>

export async function createGoal(userId: string, input: GoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateGoal(goalId: string, input: Partial<GoalInput>): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', goalId)
  if (error) throw error
}

export async function deleteGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', goalId)
  if (error) throw error
}

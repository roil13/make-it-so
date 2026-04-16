import { supabase } from '../supabase/client'
import type { Habit } from '../types'

type HabitInput = Pick<Habit, 'goal_id' | 'title' | 'description' | 'priority'> & {
  target_value?: number | null
  target_unit?: string | null
  current_target?: number | null
  scheduled_time?: string | null
  duration_minutes?: number | null
}

export async function createHabit(userId: string, input: HabitInput): Promise<void> {
  const { error } = await supabase.from('habits').insert({
    ...input,
    user_id: userId,
    frequency: 'daily',
    active_streak: 0,
    longest_streak: 0,
    last_completed_date: null,
  })
  if (error) throw error
}

export async function updateHabit(habitId: string, input: Partial<HabitInput>): Promise<void> {
  const { error } = await supabase.from('habits').update({ ...input, updated_at: new Date().toISOString() }).eq('id', habitId)
  if (error) throw error
}

export async function deleteHabit(habitId: string): Promise<void> {
  const { error } = await supabase.from('habits').delete().eq('id', habitId)
  if (error) throw error
}

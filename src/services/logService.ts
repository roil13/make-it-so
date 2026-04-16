import { supabase } from '../supabase/client'
import type { HabitLog } from '../types'

export async function markDone(userId: string, habitId: string, date: string): Promise<void> {
  const { error } = await supabase.rpc('mark_habit_done', {
    p_user_id: userId,
    p_habit_id: habitId,
    p_date: date,
  })
  if (error) throw error
}

export async function undoMark(userId: string, habitId: string, date: string): Promise<void> {
  const { error } = await supabase.rpc('undo_habit_done', {
    p_user_id: userId,
    p_habit_id: habitId,
    p_date: date,
  })
  if (error) throw error
}

export async function fetchLogsRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_date', startDate)
    .lte('completed_date', endDate)
  if (error) throw error
  return data ?? []
}

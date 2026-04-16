import { supabase } from '../supabase/client'
import type { ScheduleOverride } from '../types'

export async function fetchOverrides(userId: string, date: string): Promise<ScheduleOverride[]> {
  const { data, error } = await supabase
    .from('schedule_overrides')
    .select('*')
    .eq('user_id', userId)
    .eq('override_date', date)
  if (error) throw error
  return data ?? []
}

export async function upsertOverride(
  userId: string,
  itemType: 'habit' | 'task',
  itemId: string,
  date: string,
  startTime: string,
  durationMinutes: number
): Promise<void> {
  const { error } = await supabase.from('schedule_overrides').upsert(
    {
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      override_date: date,
      start_time: startTime,
      duration_minutes: durationMinutes,
    },
    { onConflict: 'user_id,item_type,item_id,override_date' }
  )
  if (error) throw error
}

export async function deleteOverride(
  userId: string,
  itemType: 'habit' | 'task',
  itemId: string,
  date: string
): Promise<void> {
  const { error } = await supabase
    .from('schedule_overrides')
    .delete()
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .eq('override_date', date)
  if (error) throw error
}

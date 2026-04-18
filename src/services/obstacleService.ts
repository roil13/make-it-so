import { supabase } from '../supabase/client'
import type { Obstacle } from '../types'

export async function createObstacle(userId: string, goalId: string, description: string, orderIndex: number): Promise<Obstacle> {
  const { data, error } = await supabase
    .from('obstacles')
    .insert({ user_id: userId, goal_id: goalId, description, order_index: orderIndex })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateObstacle(obstacleId: string, description: string): Promise<void> {
  const { error } = await supabase
    .from('obstacles')
    .update({ description })
    .eq('id', obstacleId)
  if (error) throw error
}

export async function deleteObstacle(obstacleId: string): Promise<void> {
  const { error } = await supabase.from('obstacles').delete().eq('id', obstacleId)
  if (error) throw error
}

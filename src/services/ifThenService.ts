import { supabase } from '../supabase/client'
import type { IfThenPlan } from '../types'

type IfThenInput = {
  obstacle_id: string
  goal_id: string
  trigger_condition: string
  action_plan: string
}

export async function createIfThenPlan(userId: string, input: IfThenInput): Promise<IfThenPlan> {
  const { data, error } = await supabase
    .from('if_then_plans')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateIfThenPlan(planId: string, input: Partial<Pick<IfThenPlan, 'trigger_condition' | 'action_plan' | 'active'>>): Promise<void> {
  const { error } = await supabase
    .from('if_then_plans')
    .update(input)
    .eq('id', planId)
  if (error) throw error
}

export async function deleteIfThenPlan(planId: string): Promise<void> {
  const { error } = await supabase.from('if_then_plans').delete().eq('id', planId)
  if (error) throw error
}

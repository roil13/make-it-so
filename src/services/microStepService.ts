import { supabase } from '../supabase/client'
import type { MicroStep } from '../types'

type MicroStepInput = Pick<MicroStep, 'goal_id' | 'title' | 'description'>

export async function createMicroStep(userId: string, input: MicroStepInput): Promise<MicroStep> {
  const { data, error } = await supabase
    .from('micro_steps')
    .insert({ ...input, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMicroStep(stepId: string, input: Partial<MicroStepInput>): Promise<void> {
  const { error } = await supabase
    .from('micro_steps')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', stepId)
  if (error) throw error
}

export async function deleteMicroStep(stepId: string): Promise<void> {
  const { error } = await supabase.from('micro_steps').delete().eq('id', stepId)
  if (error) throw error
}

export async function markMicroStepDone(_userId: string, stepId: string, date: string): Promise<void> {
  const { error } = await supabase.rpc('mark_micro_step_done', {
    p_step_id: stepId,
    p_date: date,
  })
  if (error) throw error
}

export async function undoMicroStepDone(_userId: string, stepId: string, date: string): Promise<void> {
  const { error } = await supabase.rpc('undo_micro_step_done', {
    p_step_id: stepId,
    p_date: date,
  })
  if (error) throw error
}

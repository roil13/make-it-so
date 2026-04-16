import { supabase } from '../supabase/client'
import type { Project } from '../types'

type ProjectInput = Pick<Project, 'goal_id' | 'title' | 'description' | 'task_order'>

export async function createProject(userId: string, input: ProjectInput): Promise<void> {
  const { error } = await supabase.from('projects').insert({ ...input, user_id: userId })
  if (error) throw error
}

export async function updateProject(projectId: string, input: Partial<ProjectInput & Pick<Project, 'status'>>): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', projectId)
  if (error) throw error
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) throw error
}

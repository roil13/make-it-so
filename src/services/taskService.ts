import { supabase } from '../supabase/client'
import type { Task } from '../types'

type TaskInput = Pick<Task, 'project_id' | 'title' | 'description' | 'order_index'> & {
  scheduled_time?: string | null
  duration_minutes?: number | null
  due_date?: string | null
}

export async function createTask(userId: string, input: TaskInput): Promise<void> {
  const { error } = await supabase.from('tasks').insert({ ...input, user_id: userId })
  if (error) throw error
}

export async function updateTask(taskId: string, input: Partial<TaskInput & Pick<Task, 'status'>>): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', taskId)
  if (error) throw error
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw error
}

export async function markTaskDone(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'done', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', taskId)
  if (error) throw error
}

export async function undoTaskDone(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'todo', completed_at: null, updated_at: new Date().toISOString() })
    .eq('id', taskId)
  if (error) throw error
}

export async function reorderTasks(items: { id: string; order_index: number }[]): Promise<void> {
  const updates = items.map(({ id, order_index }) =>
    supabase.from('tasks').update({ order_index, updated_at: new Date().toISOString() }).eq('id', id)
  )
  const results = await Promise.all(updates)
  const err = results.find((r) => r.error)
  if (err?.error) throw err.error
}

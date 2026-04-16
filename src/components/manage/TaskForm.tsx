import { useState, type FormEvent } from 'react'
import { Button } from '../shared/Button'
import type { Task, Project } from '../../types'

interface Props {
  projects: Project[]
  initial?: Partial<Task>
  onSubmit: (data: { project_id: string; title: string; description: string; order_index: number }) => Promise<void>
  onCancel: () => void
}

export function TaskForm({ projects, initial, onSubmit, onCancel }: Props) {
  const [project_id, setProjectId] = useState(initial?.project_id ?? projects[0]?.id ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!project_id) { setError('Select a project first'); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({ project_id, title, description, order_index: initial?.order_index ?? 0 })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Project</label>
        <select className={field} value={project_id} onChange={(e) => setProjectId(e.target.value)} required>
          <option value="">Select a project...</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Task Title</label>
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Write project brief" />
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Description</label>
        <textarea className={`${field} resize-none`} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving...' : 'Save Task'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

import { useState, type FormEvent } from 'react'
import { ListOrdered, Shuffle } from 'lucide-react'
import { Button } from '../shared/Button'
import type { Project, Goal } from '../../types'

interface Props {
  goals: Goal[]
  initial?: Partial<Project>
  onSubmit: (data: { goal_id: string; title: string; description: string; task_order: 'sequential' | 'any' }) => Promise<void>
  onCancel: () => void
}

export function ProjectForm({ goals, initial, onSubmit, onCancel }: Props) {
  const projectGoals = goals.filter((g) => g.goal_type === 'project')
  const [goal_id, setGoalId] = useState(initial?.goal_id ?? projectGoals[0]?.id ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [taskOrder, setTaskOrder] = useState<'sequential' | 'any'>(initial?.task_order ?? 'any')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!goal_id) { setError('Select a goal first'); return }
    setError('')
    setLoading(true)
    try {
      await onSubmit({ goal_id, title, description, task_order: taskOrder })
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
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Goal</label>
        <select className={field} value={goal_id} onChange={(e) => setGoalId(e.target.value)} required>
          <option value="">Select a goal...</option>
          {projectGoals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Project Title</label>
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Launch website" />
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Description</label>
        <textarea className={`${field} resize-none`} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-2">Task Order</label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'any', icon: Shuffle, label: 'Any Order', desc: 'Complete tasks in any order' },
            { value: 'sequential', icon: ListOrdered, label: 'In Order', desc: 'Complete tasks one by one' },
          ] as const).map(({ value, icon: Icon, label, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTaskOrder(value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center transition-colors ${
                taskOrder === value
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:border-muted hover:text-foreground'
              }`}
            >
              <Icon size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
              <span className="text-xs opacity-70">{desc}</span>
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving...' : 'Save Project'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

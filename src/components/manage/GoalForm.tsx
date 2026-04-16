import { useState, type FormEvent } from 'react'
import { Button } from '../shared/Button'
import type { Goal } from '../../types'

const COLORS = [
  '#2D6A4F', '#40916C', '#52B788', '#48CAE4',
  '#3B82F6', '#A855F7', '#D96250', '#F59E0B',
]

interface Props {
  initial?: Partial<Goal>
  onSubmit: (data: { title: string; description: string; category: string; color: string; priority: number; goal_type: 'habit' | 'project' }) => Promise<void>
  onCancel: () => void
}

export function GoalForm({ initial, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState(initial?.category ?? 'General')
  const [color, setColor] = useState(initial?.color ?? COLORS[0]!)
  const [priority, setPriority] = useState(initial?.priority ?? 3)
  const [goalType, setGoalType] = useState<'habit' | 'project'>(initial?.goal_type ?? 'habit')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit({ title, description, category, color, priority, goal_type: goalType })
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
        <label className="block text-muted text-xs uppercase tracking-widest mb-2">Goal Type</label>
        <div className="flex gap-2 bg-surface-2 border border-border rounded-lg p-1">
          <button
            type="button"
            onClick={() => setGoalType('habit')}
            className={`flex-1 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors ${goalType === 'habit' ? 'bg-accent text-on-accent' : 'text-muted hover:text-foreground'}`}
          >
            Daily Habits
          </button>
          <button
            type="button"
            onClick={() => setGoalType('project')}
            className={`flex-1 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors ${goalType === 'project' ? 'bg-accent text-on-accent' : 'text-muted hover:text-foreground'}`}
          >
            Project
          </button>
        </div>
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Title</label>
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Description</label>
        <textarea className={`${field} resize-none`} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Category</label>
        <input className={field} value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{ background: c, borderColor: color === c ? '#1A2E1C' : 'transparent' }}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Priority (1–5)</label>
        <input
          type="range" min={1} max={5} step={1}
          value={priority} onChange={(e) => setPriority(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="flex justify-between text-xs text-muted mt-0.5">
          <span>Low</span><span className="text-foreground font-bold">{priority}</span><span>High</span>
        </div>
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : 'Save Goal'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

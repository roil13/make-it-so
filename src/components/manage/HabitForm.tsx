import { useState, type FormEvent } from 'react'
import { Button } from '../shared/Button'
import type { Habit, Goal } from '../../types'

interface HabitData {
  goal_id: string
  title: string
  description: string
  priority: number
  target_value: number | null
  target_unit: string | null
  current_target: number | null
  scheduled_time: string | null
  duration_minutes: number | null
}

interface Props {
  goals: Goal[]
  initial?: Partial<Habit>
  onSubmit: (data: HabitData) => Promise<void>
  onCancel: () => void
}

export function HabitForm({ goals, initial, onSubmit, onCancel }: Props) {
  const habitGoals = goals.filter((g) => g.goal_type === 'habit')
  const [goal_id, setGoalId] = useState(initial?.goal_id ?? habitGoals[0]?.id ?? '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priority, setPriority] = useState(initial?.priority ?? 3)
  const [trackTarget, setTrackTarget] = useState(initial?.target_value != null)
  const [targetValue, setTargetValue] = useState(initial?.target_value?.toString() ?? '')
  const [targetUnit, setTargetUnit] = useState(initial?.target_unit ?? '')
  const [currentTarget, setCurrentTarget] = useState(initial?.current_target?.toString() ?? '')
  const [scheduleTime, setScheduleTime] = useState(initial?.scheduled_time?.slice(0, 5) ?? '')
  const [duration, setDuration] = useState(initial?.duration_minutes?.toString() ?? '30')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!goal_id) { setError('Select a goal first'); return }
    if (trackTarget && (!targetValue || !targetUnit || !currentTarget)) {
      setError('Fill in all target fields or disable target tracking'); return
    }
    setError('')
    setLoading(true)
    try {
      await onSubmit({
        goal_id, title, description, priority,
        target_value:     trackTarget ? Number(targetValue)   : null,
        target_unit:      trackTarget ? targetUnit            : null,
        current_target:   trackTarget ? Number(currentTarget) : null,
        scheduled_time:   scheduleTime ? `${scheduleTime}:00` : null,
        duration_minutes: scheduleTime ? Number(duration) : null,
      })
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
          {habitGoals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Habit Title</label>
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Morning workout" />
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Description</label>
        <textarea className={`${field} resize-none`} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block text-muted text-xs uppercase tracking-widest mb-1">Priority (1–5)</label>
        <input type="range" min={1} max={5} step={1} value={priority} onChange={(e) => setPriority(Number(e.target.value))} className="w-full accent-accent" />
        <div className="flex justify-between text-xs text-muted mt-0.5">
          <span>Low</span><span className="text-foreground font-bold">{priority}</span><span>High</span>
        </div>
      </div>

      {/* Progressive target tracking */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={trackTarget}
            onChange={(e) => setTrackTarget(e.target.checked)}
            className="accent-accent w-4 h-4"
          />
          <span className="text-foreground text-sm font-bold">Track a numeric target</span>
        </label>
        <p className="text-muted text-xs -mt-1">e.g. run 5 km, read 30 pages — increase it gradually over time</p>
        {trackTarget && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-muted text-xs uppercase tracking-widest mb-1">Starting at</label>
              <input
                type="number" min={0} step="any"
                className={field} value={currentTarget}
                onChange={(e) => setCurrentTarget(e.target.value)}
                placeholder="e.g. 2"
                required={trackTarget}
              />
            </div>
            <div>
              <label className="block text-muted text-xs uppercase tracking-widest mb-1">Goal target</label>
              <input
                type="number" min={0} step="any"
                className={field} value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 5"
                required={trackTarget}
              />
            </div>
            <div>
              <label className="block text-muted text-xs uppercase tracking-widest mb-1">Unit</label>
              <input
                className={field} value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                placeholder="km, pages…"
                required={trackTarget}
              />
            </div>
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <p className="text-foreground text-sm font-bold">Schedule (optional)</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-muted text-xs uppercase tracking-widest mb-1">Time</label>
            <input type="time" className={field} value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-muted text-xs uppercase tracking-widest mb-1">Duration (min)</label>
            <input type="number" min={5} max={480} step={5} className={field} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}
      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving...' : 'Save Habit'}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

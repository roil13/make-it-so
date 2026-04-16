import { Pencil, Trash2, Flame } from 'lucide-react'
import type { Habit, Goal } from '../../types'

interface Props {
  habits: Habit[]
  goals: Goal[]
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
}

export function HabitList({ habits, goals, onEdit, onDelete }: Props) {
  const goalMap = new Map(goals.map((g) => [g.id, g]))

  return (
    <div className="space-y-2">
      {habits.map((habit) => {
        const goal = goalMap.get(habit.goal_id)
        return (
          <div key={habit.id} className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: goal?.color ?? '#7B7168' }} />
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-bold uppercase tracking-widest truncate">{habit.title}</p>
              <p className="text-muted text-xs truncate">{goal?.title ?? 'Unknown goal'} · Priority {habit.priority}</p>
            </div>
            {habit.active_streak > 0 && (
              <span className="flex items-center gap-1 text-xs text-accent font-bold">
                <Flame size={12} /> {habit.active_streak}
              </span>
            )}
            <button onClick={() => onEdit(habit)} className="text-muted hover:text-foreground transition-colors p-1"><Pencil size={15} /></button>
            <button onClick={() => onDelete(habit.id)} className="text-muted hover:text-danger transition-colors p-1"><Trash2 size={15} /></button>
          </div>
        )
      })}
    </div>
  )
}

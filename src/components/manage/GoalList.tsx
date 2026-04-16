import { Pencil, Trash2 } from 'lucide-react'
import type { Goal } from '../../types'

interface Props {
  goals: Goal[]
  onEdit: (goal: Goal) => void
  onDelete: (goalId: string) => void
}

export function GoalList({ goals, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-2">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3"
        >
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: goal.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-foreground text-sm font-bold uppercase tracking-widest truncate">{goal.title}</p>
            <p className="text-muted text-xs truncate">{goal.category} · Priority {goal.priority} · {goal.goal_type === 'project' ? 'Project' : 'Habits'}</p>
          </div>
          <button onClick={() => onEdit(goal)} className="text-muted hover:text-foreground transition-colors p-1">
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(goal.id)} className="text-muted hover:text-danger transition-colors p-1">
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}

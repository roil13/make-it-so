import { CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '../shared/Button'
import type { Task, Project, Goal } from '../../types'

interface Props {
  task: Task
  project: Project
  goal: Goal
  onDone: (taskId: string) => void
  onUndo: (taskId: string) => void
  loading: boolean
  isRTL?: boolean
}

export function TaskActionCard({ task, project, goal, onDone, onUndo, loading, isRTL = false }: Props) {
  const done = task.status === 'done'

  return (
    <div
      className={clsx(
        'bg-surface border rounded-xl p-4 flex items-center gap-4 transition-all duration-300',
        done
          ? 'border-border opacity-60'
          : isRTL
            ? 'border-r-4 border-l border-t border-b border-water'
            : 'border-l-4 border-r border-t border-b border-water'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={clsx('font-bold text-sm uppercase tracking-widest truncate', done ? 'text-muted line-through' : 'text-foreground')}>
            {task.title}
          </p>
        </div>
        <p className="text-xs text-muted truncate">{project.title} · {goal.title}</p>
      </div>

      {done ? (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-success" size={20} />
          <button
            onClick={() => onUndo(task.id)}
            disabled={loading}
            className="text-xs text-muted hover:text-foreground uppercase tracking-widest transition-colors"
          >
            Undo
          </button>
        </div>
      ) : (
        <Button variant="water" size="sm" onClick={() => onDone(task.id)} disabled={loading}>Do it</Button>
      )}
    </div>
  )
}

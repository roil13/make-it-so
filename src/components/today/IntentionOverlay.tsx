import { Repeat, CheckSquare, Zap } from 'lucide-react'
import { Button } from '../shared/Button'
import { formatDisplayDate, today } from '../../utils/dates'
import type { Habit, Goal, Task, Project } from '../../types'

interface Props {
  habits: Habit[]
  availableTasks: Task[]
  goals: Map<string, Goal>
  projects: Map<string, Project>
  onCommit: () => void
}

export function IntentionOverlay({ habits, availableTasks, goals, projects, onCommit }: Props) {
  const dateLabel = formatDisplayDate(today())
  const hasItems = habits.length > 0 || availableTasks.length > 0

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm px-6">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-muted text-xs uppercase tracking-widest">{dateLabel}</p>
          <h1 className="text-foreground font-black text-2xl uppercase tracking-widest">Today's Mission</h1>
          <p className="text-muted text-sm">Commit to these before you start.</p>
        </div>

        {/* Item list */}
        {hasItems ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {habits.map((habit) => {
              const goal = goals.get(habit.goal_id)
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3"
                  style={{ borderLeftColor: goal?.color, borderLeftWidth: 3 }}
                >
                  <Repeat size={14} className="text-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-bold truncate">{habit.title}</p>
                    {goal && <p className="text-muted text-xs truncate">{goal.title}</p>}
                  </div>
                </div>
              )
            })}
            {availableTasks.map((task) => {
              const project = projects.get(task.project_id)
              const goal = project ? goals.get(project.goal_id) : undefined
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3"
                  style={{ borderLeftColor: goal?.color, borderLeftWidth: 3 }}
                >
                  <CheckSquare size={14} className="text-muted flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-bold truncate">{task.title}</p>
                    {project && <p className="text-muted text-xs truncate">{project.title}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl px-4 py-6 text-center">
            <p className="text-muted text-sm">No habits or tasks yet.</p>
            <p className="text-muted text-xs mt-1">Go to Manage to add some.</p>
          </div>
        )}

        {/* CTA */}
        <Button size="lg" onClick={onCommit} className="w-full">
          <Zap size={18} />
          Make it So
        </Button>
      </div>
    </div>
  )
}

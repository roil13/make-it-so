import { Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react'
import type { Task, Project, Goal } from '../../types'

interface Props {
  tasks: Task[]
  projects: Project[]
  goals: Goal[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onToggleDone: (task: Task) => void
}

export function TaskList({ tasks, projects, goals, onEdit, onDelete, onToggleDone }: Props) {
  const projectMap = new Map(projects.map((p) => [p.id, p]))
  const goalMap = new Map(goals.map((g) => [g.id, g]))

  // Group tasks by project
  const tasksByProject = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.project_id]) acc[task.project_id] = []
    acc[task.project_id]!.push(task)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(tasksByProject).map(([projectId, projectTasks]) => {
        const project = projectMap.get(projectId)
        const goal = project ? goalMap.get(project.goal_id) : undefined

        return (
          <div key={projectId} className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-border bg-surface-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: goal?.color ?? '#7B7168' }} />
                <p className="text-xs font-bold uppercase tracking-widest text-muted">{project?.title ?? 'Unknown project'}</p>
              </div>
            </div>
            <div className="divide-y divide-border">
              {projectTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => onToggleDone(task)} className="flex-shrink-0">
                    {task.status === 'done'
                      ? <CheckCircle2 size={16} className="text-success" />
                      : <Circle size={16} className="text-muted hover:text-accent transition-colors" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${task.status === 'done' ? 'text-muted line-through' : 'text-foreground'}`}>
                      {task.title}
                    </p>
                    {task.description && <p className="text-xs text-muted truncate">{task.description}</p>}
                  </div>
                  <button onClick={() => onEdit(task)} className="text-muted hover:text-foreground transition-colors p-1"><Pencil size={15} /></button>
                  <button onClick={() => onDelete(task.id)} className="text-muted hover:text-danger transition-colors p-1"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

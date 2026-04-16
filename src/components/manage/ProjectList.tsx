import { Pencil, Trash2, ListOrdered, Shuffle } from 'lucide-react'
import type { Project, Goal, Task } from '../../types'

interface Props {
  projects: Project[]
  goals: Goal[]
  tasks: Task[]
  onEdit: (project: Project) => void
  onDelete: (projectId: string) => void
}

export function ProjectList({ projects, goals, tasks, onEdit, onDelete }: Props) {
  const goalMap = new Map(goals.map((g) => [g.id, g]))

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const goal = goalMap.get(project.goal_id)
        const projectTasks = tasks.filter((t) => t.project_id === project.id)
        const doneTasks = projectTasks.filter((t) => t.status === 'done').length

        return (
          <div key={project.id} className="flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: goal?.color ?? '#7B7168' }} />
            <div className="flex-1 min-w-0">
              <p className="text-foreground text-sm font-bold uppercase tracking-widest truncate">{project.title}</p>
              <p className="text-muted text-xs truncate flex items-center gap-1">
                {goal?.title ?? 'Unknown goal'} ·{' '}
                {project.task_order === 'sequential'
                  ? <ListOrdered size={10} className="inline" />
                  : <Shuffle size={10} className="inline" />}
                {' '}{doneTasks}/{projectTasks.length} tasks
              </p>
            </div>
            <button onClick={() => onEdit(project)} className="text-muted hover:text-foreground transition-colors p-1"><Pencil size={15} /></button>
            <button onClick={() => onDelete(project.id)} className="text-muted hover:text-danger transition-colors p-1"><Trash2 size={15} /></button>
          </div>
        )
      })}
    </div>
  )
}

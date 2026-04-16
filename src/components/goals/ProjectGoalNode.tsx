import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, Circle, ListOrdered, Shuffle } from 'lucide-react'
import type { Goal, Project, Task } from '../../types'

interface Props {
  goal: Goal
  projects: Project[]
  tasks: Task[]
}

export function ProjectGoalNode({ goal, projects, tasks }: Props) {
  const [open, setOpen] = useState(true)

  const goalProjects = projects.filter((p) => p.goal_id === goal.id)
  const totalTasks = goalProjects.reduce((sum, p) => sum + tasks.filter((t) => t.project_id === p.id).length, 0)
  const doneTasks = goalProjects.reduce((sum, p) => sum + tasks.filter((t) => t.project_id === p.id && t.status === 'done').length, 0)

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: goal.color }} />
        <span className="font-bold text-foreground text-sm uppercase tracking-widest flex-1 text-left rtl:text-right">{goal.title}</span>
        {totalTasks > 0 && (
          <span className="text-xs text-muted mr-2 rtl:mr-0 rtl:ml-2">{doneTasks}/{totalTasks} tasks</span>
        )}
        {open ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
      </button>

      {open && goalProjects.length > 0 && (
        <div className="border-t border-border divide-y divide-border">
          {goalProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.project_id === project.id)
            const projectDone = projectTasks.filter((t) => t.status === 'done').length
            const pct = projectTasks.length === 0 ? 0 : Math.round((projectDone / projectTasks.length) * 100)

            return (
              <div key={project.id} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  {project.task_order === 'sequential'
                    ? <ListOrdered size={14} className="text-muted flex-shrink-0" />
                    : <Shuffle size={14} className="text-muted flex-shrink-0" />}
                  <span className="text-sm font-bold text-foreground flex-1">{project.title}</span>
                  <span className="text-xs text-muted">{projectDone}/{projectTasks.length}</span>
                </div>
                {projectTasks.length > 0 && (
                  <>
                    <div className="w-full bg-surface-2 rounded-full h-1.5 mb-2">
                      <div
                        className="bg-accent h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="space-y-1">
                      {projectTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 text-xs">
                          {task.status === 'done'
                            ? <CheckCircle2 size={12} className="text-success flex-shrink-0" />
                            : <Circle size={12} className="text-muted flex-shrink-0" />}
                          <span className={task.status === 'done' ? 'text-muted line-through' : 'text-foreground'}>{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {projectTasks.length === 0 && (
                  <p className="text-xs text-muted">No tasks yet.</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {open && goalProjects.length === 0 && (
        <div className="border-t border-border px-6 py-3 text-xs text-muted">No projects linked to this goal yet.</div>
      )}
    </div>
  )
}

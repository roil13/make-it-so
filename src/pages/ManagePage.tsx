import { useState } from 'react'
import { Plus, Target, Repeat, FolderOpen, CheckSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { createGoal, updateGoal, deleteGoal } from '../services/goalService'
import { createHabit, updateHabit, deleteHabit } from '../services/habitService'
import { createProject, updateProject, deleteProject } from '../services/projectService'
import { createTask, updateTask, deleteTask, markTaskDone, undoTaskDone } from '../services/taskService'
import { GoalList } from '../components/manage/GoalList'
import { HabitList } from '../components/manage/HabitList'
import { ProjectList } from '../components/manage/ProjectList'
import { TaskList } from '../components/manage/TaskList'
import { GoalForm } from '../components/manage/GoalForm'
import { HabitForm } from '../components/manage/HabitForm'
import { ProjectForm } from '../components/manage/ProjectForm'
import { TaskForm } from '../components/manage/TaskForm'
import { Modal } from '../components/shared/Modal'
import { Button } from '../components/shared/Button'
import { EmptyState } from '../components/shared/EmptyState'
import { Spinner } from '../components/shared/Spinner'
import type { Goal, Habit, Project, Task } from '../types'

type Tab = 'goals' | 'habits' | 'projects' | 'tasks'

const TABS: { id: Tab; icon: typeof Target; labelKey: string }[] = [
  { id: 'goals', icon: Target, labelKey: 'manage.goals' },
  { id: 'habits', icon: Repeat, labelKey: 'manage.habits' },
  { id: 'projects', icon: FolderOpen, labelKey: 'manage.projects' },
  { id: 'tasks', icon: CheckSquare, labelKey: 'manage.tasks' },
]

export function ManagePage() {
  const { user } = useAuth()
  const { goals, habits, projects, tasks, loading, refetch } = useData()
  const { t } = useTranslation()

  const [tab, setTab] = useState<Tab>('goals')
  const [goalModal, setGoalModal] = useState(false)
  const [habitModal, setHabitModal] = useState(false)
  const [projectModal, setProjectModal] = useState(false)
  const [taskModal, setTaskModal] = useState(false)

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  function openNewGoal() { setEditingGoal(null); setGoalModal(true) }
  function openEditGoal(g: Goal) { setEditingGoal(g); setGoalModal(true) }
  function openNewHabit() { setEditingHabit(null); setHabitModal(true) }
  function openEditHabit(h: Habit) { setEditingHabit(h); setHabitModal(true) }
  function openNewProject() { setEditingProject(null); setProjectModal(true) }
  function openEditProject(p: Project) { setEditingProject(p); setProjectModal(true) }
  function openNewTask() { setEditingTask(null); setTaskModal(true) }
  function openEditTask(task: Task) { setEditingTask(task); setTaskModal(true) }

  async function handleGoalSubmit(data: { title: string; description: string; category: string; color: string; priority: number; goal_type: 'habit' | 'project' }) {
    if (!user) return
    if (editingGoal) await updateGoal(editingGoal.id, data)
    else await createGoal(user.id, data)
    setGoalModal(false)
    await refetch()
  }

  async function handleHabitSubmit(data: { goal_id: string; title: string; description: string; priority: number; target_value: number | null; target_unit: string | null; current_target: number | null; scheduled_time: string | null; duration_minutes: number | null }) {
    if (!user) return
    if (editingHabit) await updateHabit(editingHabit.id, data)
    else await createHabit(user.id, data)
    setHabitModal(false)
    await refetch()
  }

  async function handleProjectSubmit(data: { goal_id: string; title: string; description: string; task_order: 'sequential' | 'any' }) {
    if (!user) return
    if (editingProject) await updateProject(editingProject.id, data)
    else await createProject(user.id, data)
    setProjectModal(false)
    await refetch()
  }

  async function handleTaskSubmit(data: { project_id: string; title: string; description: string; order_index: number; scheduled_time: string | null; duration_minutes: number | null; due_date: string | null }) {
    if (!user) return
    if (editingTask) await updateTask(editingTask.id, data)
    else {
      const projectTasks = tasks.filter((t) => t.project_id === data.project_id)
      const nextIndex = projectTasks.length
      await createTask(user.id, { ...data, order_index: nextIndex })
    }
    setTaskModal(false)
    await refetch()
  }

  async function handleDeleteGoal(goalId: string) {
    if (!user || !confirm(t('manage.deleteGoalConfirm'))) return
    await deleteGoal(goalId)
    await refetch()
  }

  async function handleDeleteHabit(habitId: string) {
    if (!user || !confirm(t('manage.deleteHabitConfirm'))) return
    await deleteHabit(habitId)
    await refetch()
  }

  async function handleDeleteProject(projectId: string) {
    if (!user || !confirm(t('manage.deleteProjectConfirm'))) return
    await deleteProject(projectId)
    await refetch()
  }

  async function handleDeleteTask(taskId: string) {
    if (!user || !confirm(t('manage.deleteTaskConfirm'))) return
    await deleteTask(taskId)
    await refetch()
  }

  async function handleToggleTaskDone(task: Task) {
    if (task.status === 'done') await undoTaskDone(task.id)
    else await markTaskDone(task.id)
    await refetch()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const addActions: Record<Tab, () => void> = {
    goals: openNewGoal,
    habits: openNewHabit,
    projects: openNewProject,
    tasks: openNewTask,
  }

  const addLabels: Record<Tab, string> = {
    goals: t('manage.addGoal'),
    habits: t('manage.addHabit'),
    projects: t('manage.addProject'),
    tasks: t('manage.addTask'),
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground font-black text-xl uppercase tracking-widest">{t('manage.heading')}</h1>
        <Button size="sm" onClick={addActions[tab]}>
          <Plus size={14} /> {addLabels[tab]}
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
        {TABS.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
              tab === id ? 'bg-accent text-on-accent' : 'text-muted hover:text-foreground'
            }`}
          >
            <Icon size={12} />
            <span className="hidden sm:inline">{t(labelKey)}</span>
          </button>
        ))}
      </div>

      {/* Goals tab */}
      {tab === 'goals' && (
        goals.length === 0
          ? <EmptyState icon={<Target size={48} />} title={t('manage.noGoals')} description={t('manage.noGoalsDescription')} action={<Button size="sm" onClick={openNewGoal}><Plus size={14} /> {t('manage.addGoal')}</Button>} />
          : <GoalList goals={goals} onEdit={openEditGoal} onDelete={handleDeleteGoal} />
      )}

      {/* Habits tab */}
      {tab === 'habits' && (
        habits.length === 0
          ? <EmptyState icon={<Repeat size={48} />} title={t('manage.noHabits')} description={t('manage.noHabitsDescription')} action={<Button size="sm" onClick={openNewHabit} disabled={goals.filter((g) => g.goal_type === 'habit').length === 0}><Plus size={14} /> {t('manage.addHabit')}</Button>} />
          : <HabitList habits={habits} goals={goals} onEdit={openEditHabit} onDelete={handleDeleteHabit} />
      )}

      {/* Projects tab */}
      {tab === 'projects' && (
        projects.length === 0
          ? <EmptyState icon={<FolderOpen size={48} />} title={t('manage.noProjects')} description={t('manage.noProjectsDescription')} action={<Button size="sm" onClick={openNewProject} disabled={goals.filter((g) => g.goal_type === 'project').length === 0}><Plus size={14} /> {t('manage.addProject')}</Button>} />
          : <ProjectList projects={projects} goals={goals} tasks={tasks} onEdit={openEditProject} onDelete={handleDeleteProject} />
      )}

      {/* Tasks tab */}
      {tab === 'tasks' && (
        tasks.length === 0
          ? <EmptyState icon={<CheckSquare size={48} />} title={t('manage.noTasks')} description={t('manage.noTasksDescription')} action={<Button size="sm" onClick={openNewTask} disabled={projects.length === 0}><Plus size={14} /> {t('manage.addTask')}</Button>} />
          : <TaskList tasks={tasks} projects={projects} goals={goals} onEdit={openEditTask} onDelete={handleDeleteTask} onToggleDone={handleToggleTaskDone} />
      )}

      {/* Modals */}
      <Modal open={goalModal} onClose={() => setGoalModal(false)} title={editingGoal ? t('goalForm.editGoal') : t('goalForm.newGoal')}>
        <GoalForm initial={editingGoal ?? undefined} onSubmit={handleGoalSubmit} onCancel={() => setGoalModal(false)} />
      </Modal>

      <Modal open={habitModal} onClose={() => setHabitModal(false)} title={editingHabit ? t('habitForm.editHabit') : t('habitForm.newHabit')}>
        <HabitForm goals={goals} initial={editingHabit ?? undefined} onSubmit={handleHabitSubmit} onCancel={() => setHabitModal(false)} />
      </Modal>

      <Modal open={projectModal} onClose={() => setProjectModal(false)} title={editingProject ? t('projectForm.editProject') : t('projectForm.newProject')}>
        <ProjectForm goals={goals} initial={editingProject ?? undefined} onSubmit={handleProjectSubmit} onCancel={() => setProjectModal(false)} />
      </Modal>

      <Modal open={taskModal} onClose={() => setTaskModal(false)} title={editingTask ? t('taskForm.editTask') : t('taskForm.newTask')}>
        <TaskForm projects={projects} initial={editingTask ?? undefined} onSubmit={handleTaskSubmit} onCancel={() => setTaskModal(false)} />
      </Modal>
    </div>
  )
}

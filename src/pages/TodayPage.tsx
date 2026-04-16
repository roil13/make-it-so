import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { getTopPriority } from '../utils/priority'
import { markDone, undoMark } from '../services/logService'
import { markTaskDone, undoTaskDone } from '../services/taskService'
import { MakeItSoBanner } from '../components/today/MakeItSoBanner'
import { HabitActionCard } from '../components/today/HabitActionCard'
import { TaskActionCard } from '../components/today/TaskActionCard'
import { CompletionRing } from '../components/today/CompletionRing'
import { IntentionOverlay } from '../components/today/IntentionOverlay'
import { MilestoneCelebration, MILESTONE_DAYS, getCelebrated, markCelebrated } from '../components/today/MilestoneCelebration'
import { Spinner } from '../components/shared/Spinner'
import { useDailyIntention } from '../hooks/useDailyIntention'
import { useStreakFreeze } from '../hooks/useStreakFreeze'
import { useJustStart } from '../hooks/useJustStart'
import { today } from '../utils/dates'
import type { Habit, Goal } from '../types'

export function TodayPage() {
  const { user } = useAuth()
  const { habits, goals, todayLogs, projects, tasks, loading, refetch } = useData()
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'he'

  const { hasCommitted, commit } = useDailyIntention()
  const { canFreeze, usedFreezeToday, recordFreeze } = useStreakFreeze()
  const justStart = useJustStart()

  const [celebration, setCelebration] = useState<{ habit: Habit; goal: Goal; days: number } | null>(null)

  const goalMap = new Map(goals.map((g) => [g.id, g]))
  const projectMap = new Map(projects.map((p) => [p.id, p]))

  // Determine available tasks (unblocked by task_order)
  const availableTasks = tasks.filter((task) => {
    if (task.status === 'done') return false
    const project = projectMap.get(task.project_id)
    if (!project || project.status !== 'active') return false
    if (project.task_order === 'sequential') {
      // Only show the first incomplete task in the project
      const projectTasks = tasks
        .filter((t) => t.project_id === project.id && t.status !== 'done')
        .sort((a, b) => a.order_index - b.order_index)
      return projectTasks[0]?.id === task.id
    }
    return true
  })

  const topHabit = getTopPriority(habits, goals, todayLogs)
  const habitsDoneCount = habits.filter((h) => todayLogs.some((l) => l.habit_id === h.id)).length
  const tasksDoneToday = tasks.filter((t) => t.status === 'done').length
  const totalItems = habits.length + availableTasks.length + tasksDoneToday
  const doneItems = habitsDoneCount + tasksDoneToday
  const allDone = totalItems > 0 && doneItems === totalItems

  async function handleHabitDone(habitId: string) {
    if (!user) return
    setActionLoading(true)
    setError('')
    try {
      await markDone(user.id, habitId, today())
      await refetch()
      // Milestone detection (use updated habits from DataContext after refetch)
      // We read habits via closure — after refetch the context will have updated values
      // Use a short microtask delay to let context update
      setTimeout(() => {
        const updated = habits.find((h) => h.id === habitId)
        if (!updated) return
        const streak = updated.active_streak
        if (!MILESTONE_DAYS.includes(streak)) return
        const celebrated = getCelebrated()[habitId] ?? []
        if (celebrated.includes(streak)) return
        const goal = goalMap.get(updated.goal_id)
        if (!goal) return
        markCelebrated(habitId, streak)
        setCelebration({ habit: updated, goal, days: streak })
      }, 300)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('today.somethingWentWrong'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleHabitFreeze(habitId: string) {
    if (!user) return
    setActionLoading(true)
    setError('')
    try {
      await markDone(user.id, habitId, today())
      recordFreeze(habitId)
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('today.somethingWentWrong'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleHabitUndo(habitId: string) {
    if (!user) return
    setActionLoading(true)
    setError('')
    try {
      await undoMark(user.id, habitId, today())
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('today.somethingWentWrong'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleTaskDone(taskId: string) {
    setActionLoading(true)
    setError('')
    try {
      await markTaskDone(taskId)
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('today.somethingWentWrong'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleTaskUndo(taskId: string) {
    setActionLoading(true)
    setError('')
    try {
      await undoTaskDone(taskId)
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('today.somethingWentWrong'))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  }

  if (!hasCommitted) {
    return (
      <IntentionOverlay
        habits={habits}
        availableTasks={availableTasks}
        goals={goalMap}
        projects={projectMap}
        onCommit={commit}
      />
    )
  }

  // Show done tasks in today view too
  const doneTasks = tasks.filter((t) => t.status === 'done')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {celebration && (
        <MilestoneCelebration
          habit={celebration.habit}
          goal={celebration.goal}
          days={celebration.days}
          onDismiss={() => setCelebration(null)}
        />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-foreground font-black text-xl uppercase tracking-widest">{t('today.heading')}</h1>
        <CompletionRing done={doneItems} total={totalItems} />
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-danger text-sm">
          {error}
        </div>
      )}

      <MakeItSoBanner topHabit={topHabit} allDone={allDone} onDone={handleHabitDone} onJustStart={justStart.start} loading={actionLoading} />

      {habits.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted text-xs uppercase tracking-widest">{t('today.allHabits')}</p>
          {habits.map((habit) => {
            const goal = goalMap.get(habit.goal_id)
            if (!goal) return null
            return (
              <HabitActionCard
                key={habit.id}
                habit={habit}
                goal={goal}
                todayLogs={todayLogs}
                onDone={handleHabitDone}
                onUndo={handleHabitUndo}
                onFreeze={handleHabitFreeze}
                onRefresh={refetch}
                canFreeze={canFreeze(habit.id)}
                frozenToday={usedFreezeToday(habit.id)}
                justStart={justStart}
                loading={actionLoading}
                isRTL={isRTL}
              />
            )
          })}
        </div>
      )}

      {(availableTasks.length > 0 || doneTasks.length > 0) && (
        <div className="space-y-2">
          <p className="text-muted text-xs uppercase tracking-widest">{t('today.projectTasks')}</p>
          {availableTasks.map((task) => {
            const project = projectMap.get(task.project_id)
            if (!project) return null
            const goal = goalMap.get(project.goal_id)
            if (!goal) return null
            return (
              <TaskActionCard
                key={task.id}
                task={task}
                project={project}
                goal={goal}
                onDone={handleTaskDone}
                onUndo={handleTaskUndo}
                loading={actionLoading}
                isRTL={isRTL}
              />
            )
          })}
          {doneTasks.map((task) => {
            const project = projectMap.get(task.project_id)
            if (!project) return null
            const goal = goalMap.get(project.goal_id)
            if (!goal) return null
            return (
              <TaskActionCard
                key={task.id}
                task={task}
                project={project}
                goal={goal}
                onDone={handleTaskDone}
                onUndo={handleTaskUndo}
                loading={actionLoading}
                isRTL={isRTL}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

import { Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useData } from '../contexts/DataContext'
import { GoalNode } from '../components/goals/GoalNode'
import { ProjectGoalNode } from '../components/goals/ProjectGoalNode'
import { EmptyState } from '../components/shared/EmptyState'
import { Spinner } from '../components/shared/Spinner'

export function GoalsPage() {
  const { goals, habits, todayLogs, projects, tasks, loading } = useData()
  const { t } = useTranslation()

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const habitGoals = goals.filter((g) => g.goal_type === 'habit')
  const projectGoals = goals.filter((g) => g.goal_type === 'project')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-foreground font-black text-xl uppercase tracking-widest">{t('goals.heading')}</h1>

      {goals.length === 0 ? (
        <EmptyState icon={<Target size={48} />} title={t('goals.noGoals')} description={t('goals.noGoalsDescription')} />
      ) : (
        <>
          {habitGoals.length > 0 && (
            <div className="space-y-3">
              <p className="text-muted text-xs uppercase tracking-widest">{t('goals.habitGoals')}</p>
              {habitGoals.map((goal) => (
                <GoalNode
                  key={goal.id}
                  goal={goal}
                  habits={habits.filter((h) => h.goal_id === goal.id)}
                  todayLogs={todayLogs}
                />
              ))}
            </div>
          )}

          {projectGoals.length > 0 && (
            <div className="space-y-3">
              <p className="text-muted text-xs uppercase tracking-widest">{t('goals.projectGoals')}</p>
              {projectGoals.map((goal) => (
                <ProjectGoalNode
                  key={goal.id}
                  goal={goal}
                  projects={projects}
                  tasks={tasks}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { markMicroStepDone, undoMicroStepDone } from '../services/microStepService'
import { MicroStepCard } from '../components/today/MicroStepCard'
import { DailyPrompt } from '../components/journal/DailyPrompt'
import { Spinner } from '../components/shared/Spinner'
import { today } from '../utils/dates'

export function TodayPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { goals, microSteps, todayLogs, ifThenPlans, todayJournal, loading, refetch } = useData()
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const goalMap = new Map(goals.map((g) => [g.id, g]))
  const doneIds = new Set(todayLogs.map((l) => l.micro_step_id))
  const activeIfThen = ifThenPlans.filter((p) => p.active).slice(0, 3)

  const doneCount = microSteps.filter((s) => doneIds.has(s.id)).length
  const totalCount = microSteps.length
  const allDone = totalCount > 0 && doneCount === totalCount
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  async function handleDone(stepId: string) {
    if (!user) return
    setActionLoading(true)
    setError('')
    try {
      await markMicroStepDone(user.id, stepId, today())
      await refetch()
    } catch {
      setError(t('common.somethingWentWrong'))
    } finally {
      setActionLoading(false)
    }
  }

  async function handleUndo(stepId: string) {
    if (!user) return
    setActionLoading(true)
    setError('')
    try {
      await undoMicroStepDone(user.id, stepId, today())
      await refetch()
    } catch {
      setError(t('common.somethingWentWrong'))
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-foreground font-black text-xl uppercase tracking-widest">{t('today.mission')}</h1>
        {totalCount > 0 && (
          <div className="text-end">
            <p className="text-accent font-black text-2xl leading-none">{pct}%</p>
            <p className="text-muted text-xs">{doneCount}/{totalCount}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-danger text-sm">
          {error}
        </div>
      )}

      {/* All done state */}
      {allDone && (
        <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-4 text-center">
          <p className="text-success font-bold text-sm uppercase tracking-widest">{t('today.missionComplete')}</p>
          <p className="text-muted text-xs mt-1">{t('today.allDone')}</p>
        </div>
      )}

      {/* Micro-steps */}
      {microSteps.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center space-y-3">
          <p className="text-foreground font-bold text-sm uppercase tracking-widest">{t('today.noSteps')}</p>
          <p className="text-muted text-sm">{t('today.noStepsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-muted text-xs uppercase tracking-widest">{t('today.dailyActions')}</p>
          {microSteps.map((step) => {
            const goal = goalMap.get(step.goal_id)
            if (!goal) return null
            return (
              <MicroStepCard
                key={step.id}
                step={step}
                goal={goal}
                isDone={doneIds.has(step.id)}
                loading={actionLoading}
                onDone={handleDone}
                onUndo={handleUndo}
              />
            )
          })}
        </div>
      )}

      {/* Active If-Then reminders */}
      {activeIfThen.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted text-xs uppercase tracking-widest">{t('today.contingencyPlans')}</p>
          <div className="space-y-2">
            {activeIfThen.map((plan) => {
              const goal = goalMap.get(plan.goal_id)
              return (
                <div key={plan.id} className="bg-surface border border-border rounded-xl px-4 py-3 space-y-1">
                  {goal && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: goal.color }} />
                      <p className="text-muted text-xs">{goal.title}</p>
                    </div>
                  )}
                  <p className="text-foreground text-sm">
                    <span className="text-accent font-bold text-xs uppercase tracking-widest me-1.5">{t('common.if')}</span>
                    {plan.trigger_condition}
                  </p>
                  <p className="text-foreground text-sm">
                    <span className="text-success font-bold text-xs uppercase tracking-widest me-1.5">{t('common.then')}</span>
                    {plan.action_plan}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Small wins prompt */}
      <DailyPrompt existingEntry={todayJournal} onSaved={refetch} />

      {/* Encouragement when nothing is done */}
      {!allDone && microSteps.length > 0 && doneCount === 0 && (
        <p className="text-center text-muted text-sm italic">{t('today.encouragement')}</p>
      )}
    </div>
  )
}

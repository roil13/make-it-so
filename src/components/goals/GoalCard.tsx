import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { deleteMicroStep } from '../../services/microStepService'
import { deleteObstacle } from '../../services/obstacleService'
import { deleteGoal } from '../../services/goalService'
import type { Goal, Obstacle, IfThenPlan, MicroStep } from '../../types'
import clsx from 'clsx'

interface GoalCardProps {
  goal: Goal
  obstacles: Obstacle[]
  ifThenPlans: IfThenPlan[]
  microSteps: MicroStep[]
  todayLogIds: Set<string>
  onEdit: (goal: Goal) => void
  onAddMicroStep: (goalId: string) => void
  onRefetch: () => void
}

export function GoalCard({ goal, obstacles, ifThenPlans, microSteps, todayLogIds, onEdit, onAddMicroStep, onRefetch }: GoalCardProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [expanded, setExpanded] = useState(false)

  const doneToday = microSteps.filter((s) => todayLogIds.has(s.id)).length
  const totalSteps = microSteps.length

  async function handleDeleteGoal() {
    if (!user || !confirm(t('goals.confirmDeleteGoal'))) return
    await deleteGoal(goal.id)
    onRefetch()
  }

  async function handleDeleteMicroStep(stepId: string) {
    if (!confirm(t('goals.confirmDeleteStep'))) return
    await deleteMicroStep(stepId)
    onRefetch()
  }

  async function handleDeleteObstacle(obstacleId: string) {
    if (!confirm(t('goals.confirmDeleteObstacle'))) return
    await deleteObstacle(obstacleId)
    onRefetch()
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Color accent bar */}
      <div className="h-1" style={{ backgroundColor: goal.color }} />

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: goal.color }}
              />
              <span className="text-muted text-xs uppercase tracking-widest">{goal.category}</span>
            </div>
            <p className="text-foreground font-bold text-base leading-tight">{goal.title}</p>
            {totalSteps > 0 && (
              <p className="text-muted text-xs mt-1">
                {t('goals.stepsDoneToday', { done: doneToday, total: totalSteps })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onEdit(goal)} className="text-muted hover:text-foreground transition-colors p-1">
              <Pencil size={14} />
            </button>
            <button onClick={handleDeleteGoal} className="text-muted hover:text-danger transition-colors p-1">
              <Trash2 size={14} />
            </button>
            <button onClick={() => setExpanded((e) => !e)} className="text-muted hover:text-foreground transition-colors p-1">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 space-y-4 border-t border-border pt-4">
            {/* Motivation Charter */}
            {goal.motivation_charter && (
              <div
                className="rounded-lg p-3 border-s-4 text-sm text-foreground/80 italic leading-relaxed"
                style={{ borderColor: goal.color, backgroundColor: `${goal.color}10` }}
              >
                <p className="text-muted text-xs uppercase tracking-widest not-italic mb-1">{t('goals.motivationCharter')}</p>
                {goal.motivation_charter}
              </div>
            )}

            {/* Obstacles + If-Then */}
            {obstacles.length > 0 && (
              <div>
                <p className="text-muted text-xs uppercase tracking-widest mb-2">{t('goals.obstaclesPlans')}</p>
                <div className="space-y-2">
                  {obstacles.map((obs) => {
                    const plan = ifThenPlans.find((p) => p.obstacle_id === obs.id)
                    return (
                      <div key={obs.id} className="bg-background rounded-lg p-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-foreground text-sm">⚡ {obs.description}</p>
                          <button onClick={() => handleDeleteObstacle(obs.id)} className="text-muted hover:text-danger transition-colors flex-shrink-0">
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {plan && (
                          <p className="text-muted text-xs">
                            <span className="text-accent">{t('common.if')}</span> {plan.trigger_condition} →{' '}
                            <span className="text-success">{t('common.then')}</span> {plan.action_plan}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Micro-Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-muted text-xs uppercase tracking-widest">{t('goals.microSteps')}</p>
                <button
                  onClick={() => onAddMicroStep(goal.id)}
                  className="text-muted hover:text-foreground text-xs flex items-center gap-1 transition-colors"
                >
                  <Plus size={12} /> {t('common.add')}
                </button>
              </div>
              {microSteps.length === 0 ? (
                <p className="text-muted text-xs italic">{t('goals.noMicroSteps')}</p>
              ) : (
                <div className="space-y-1.5">
                  {microSteps.map((step) => (
                    <div key={step.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={clsx(
                          'w-2 h-2 rounded-full flex-shrink-0',
                          todayLogIds.has(step.id) ? 'bg-success' : 'bg-border'
                        )} />
                        <span className="text-foreground text-sm truncate">{step.title}</span>
                        {step.active_streak > 1 && (
                          <span className="text-muted text-xs">{step.active_streak}d</span>
                        )}
                      </div>
                      <button onClick={() => handleDeleteMicroStep(step.id)} className="text-muted hover:text-danger transition-colors flex-shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

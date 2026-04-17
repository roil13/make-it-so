import { Check, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { MicroStep, Goal } from '../../types'
import clsx from 'clsx'

interface MicroStepCardProps {
  step: MicroStep
  goal: Goal
  isDone: boolean
  loading: boolean
  onDone: (stepId: string) => void
  onUndo: (stepId: string) => void
}

export function MicroStepCard({ step, goal, isDone, loading, onDone, onUndo }: MicroStepCardProps) {
  const { t } = useTranslation()

  return (
    <div
      className={clsx(
        'flex items-center gap-4 bg-surface border rounded-xl px-4 py-3 transition-all duration-200',
        isDone ? 'border-success/30 opacity-70' : 'border-border'
      )}
    >
      {/* Color dot */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: goal.color }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-semibold leading-tight', isDone ? 'line-through text-muted' : 'text-foreground')}>
          {step.title}
        </p>
        <p className="text-muted text-xs mt-0.5">{goal.title}</p>
      </div>

      {/* Streak */}
      {step.active_streak > 1 && (
        <div className="flex-shrink-0 text-center">
          <p className="text-accent text-xs font-bold">{step.active_streak}</p>
          <p className="text-muted text-[10px]">{t('today.days')}</p>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={() => isDone ? onUndo(step.id) : onDone(step.id)}
        disabled={loading}
        className={clsx(
          'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-50',
          isDone
            ? 'bg-success/20 text-success hover:bg-muted/20 hover:text-muted'
            : 'bg-accent/10 text-accent hover:bg-accent hover:text-white border border-accent/30'
        )}
      >
        {isDone ? <RotateCcw size={14} /> : <Check size={16} />}
      </button>
    </div>
  )
}

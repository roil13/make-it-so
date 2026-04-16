import { useEffect, useState } from 'react'
import { CheckCircle2, TrendingUp, Snowflake } from 'lucide-react'
import clsx from 'clsx'
import { Button } from '../shared/Button'
import { StreakBadge } from './StreakBadge'
import { updateHabit } from '../../services/habitService'
import type { Habit, Goal, HabitLog } from '../../types'
import type { useJustStart } from '../../hooks/useJustStart'

interface Props {
  habit: Habit
  goal: Goal
  todayLogs: HabitLog[]
  onDone: (habitId: string) => void
  onUndo: (habitId: string) => void
  onFreeze: (habitId: string) => void
  onRefresh: () => void
  canFreeze: boolean
  frozenToday: boolean
  justStart: ReturnType<typeof useJustStart>
  loading: boolean
  isRTL?: boolean
}

export function HabitActionCard({
  habit, goal, todayLogs,
  onDone, onUndo, onFreeze, onRefresh,
  canFreeze, frozenToday,
  justStart, loading, isRTL = false,
}: Props) {
  const done = todayLogs.some((l) => l.habit_id === habit.id)
  const started = justStart.isStarted(habit.id)
  const hasTarget = habit.target_value != null && habit.current_target != null

  // Elapsed time ticker for "started" state
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!started) { setElapsed(0); return }
    const ts = justStart.startedAt(habit.id) ?? Date.now()
    const tick = () => setElapsed(Math.floor((Date.now() - ts) / 60000))
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [started, habit.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleNudge() {
    if (!hasTarget) return
    const step = Math.max(0.1, Math.round(habit.target_value! * 0.1 * 10) / 10)
    const next = Math.round((habit.current_target! + step) * 100) / 100
    await updateHabit(habit.id, { current_target: next })
    onRefresh()
  }

  const progress = hasTarget
    ? Math.min(100, Math.round((habit.current_target! / habit.target_value!) * 100))
    : 0

  return (
    <div
      className={clsx(
        'bg-surface border rounded-xl p-4 transition-all duration-300',
        done
          ? 'border-border opacity-60'
          : started
            ? isRTL ? 'border-r-4 border-l border-t border-b animate-pulse-slow' : 'border-l-4 border-r border-t border-b animate-pulse-slow'
            : isRTL ? 'border-r-4 border-l border-t border-b' : 'border-l-4 border-r border-t border-b'
      )}
      style={
        !done
          ? isRTL ? { borderRightColor: goal.color } : { borderLeftColor: goal.color }
          : undefined
      }
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className={clsx('font-bold text-sm uppercase tracking-widest truncate', done ? 'text-muted line-through' : 'text-foreground')}>
              {habit.title}
            </p>
            <StreakBadge streak={habit.active_streak} />
            {frozenToday && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-water/20 text-water">
                <Snowflake size={11} /> frozen
              </span>
            )}
          </div>
          <p className="text-xs text-muted truncate">{goal.title}</p>
          {started && !done && (
            <p className="text-xs text-accent mt-1">▶ Started · {elapsed}m ago</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          {done ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-success" size={20} />
              <button onClick={() => onUndo(habit.id)} disabled={loading} className="text-xs text-muted hover:text-foreground uppercase tracking-widest transition-colors">
                Undo
              </button>
            </div>
          ) : started ? (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="success" onClick={() => { justStart.clear(habit.id); onDone(habit.id) }} disabled={loading}>
                Done!
              </Button>
              <button onClick={() => justStart.clear(habit.id)} className="text-xs text-muted hover:text-foreground transition-colors">
                not now
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {canFreeze && (
                <button
                  onClick={() => onFreeze(habit.id)}
                  disabled={loading}
                  title="Use once this week to protect your streak"
                  className="flex items-center gap-1 text-xs text-water border border-water/40 hover:border-water rounded-md px-2 py-1 transition-colors"
                >
                  <Snowflake size={11} /> Freeze
                </button>
              )}
              {hasTarget && (
                <button
                  onClick={handleNudge}
                  disabled={loading}
                  title="Nudge target up by 10%"
                  className="flex items-center gap-1 text-xs text-accent border border-accent/40 hover:border-accent rounded-md px-2 py-1 transition-colors"
                >
                  <TrendingUp size={12} /> +step
                </button>
              )}
              <Button size="sm" onClick={() => onDone(habit.id)} disabled={loading}>Do it</Button>
            </div>
          )}
          {!done && !started && (
            <button
              onClick={() => justStart.start(habit.id)}
              className="text-xs text-muted hover:text-foreground transition-colors self-end"
            >
              Just start →
            </button>
          )}
        </div>
      </div>

      {hasTarget && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted">
            <span>Current: <span className="text-foreground font-bold">{habit.current_target} {habit.target_unit}</span></span>
            <span>Goal: <span className="text-foreground font-bold">{habit.target_value} {habit.target_unit}</span></span>
          </div>
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: goal.color }} />
          </div>
        </div>
      )}
    </div>
  )
}

import { Zap, PartyPopper } from 'lucide-react'
import { Button } from '../shared/Button'
import { StreakBadge } from './StreakBadge'
import type { ScoredHabit } from '../../types'

interface Props {
  topHabit: ScoredHabit | null
  allDone: boolean
  onDone: (habitId: string) => void
  onJustStart: (habitId: string) => void
  loading: boolean
}

export function MakeItSoBanner({ topHabit, allDone, onDone, onJustStart, loading }: Props) {
  if (allDone) {
    return (
      <div className="bg-success/10 border border-success/30 rounded-2xl p-8 flex flex-col items-center text-center gap-3">
        <PartyPopper className="text-success" size={40} />
        <h2 className="text-foreground font-black text-2xl uppercase tracking-widest">Mission Complete</h2>
        <p className="text-muted text-sm">You've done everything for today. Come back tomorrow.</p>
      </div>
    )
  }

  if (!topHabit) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center text-center gap-3">
        <Zap className="text-muted" size={40} />
        <h2 className="text-muted font-black text-xl uppercase tracking-widest">No habits yet</h2>
        <p className="text-muted text-sm">Go to Manage to add your first habit.</p>
      </div>
    )
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-8 flex flex-col gap-4"
      style={{ background: `linear-gradient(135deg, #243B2A 0%, ${topHabit.goal.color}28 100%)`, border: `1px solid ${topHabit.goal.color}44` }}
    >
      <div className="absolute -top-8 -right-8 rtl:-right-auto rtl:-left-8 w-40 h-40 rounded-full blur-3xl opacity-20 animate-pulse-slow" style={{ background: topHabit.goal.color }} />
      <div className="relative">
        <p className="text-xs text-muted uppercase tracking-widest mb-1">{topHabit.goal.title}</p>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-foreground font-black text-2xl md:text-3xl uppercase tracking-widest leading-tight">{topHabit.title}</h2>
          <StreakBadge streak={topHabit.active_streak} />
        </div>
        {topHabit.description && <p className="text-muted text-sm mb-2">{topHabit.description}</p>}
        {topHabit.target_value != null && topHabit.current_target != null && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs text-muted">
              <span>Current: <span className="text-foreground font-bold">{topHabit.current_target} {topHabit.target_unit}</span></span>
              <span>Goal: <span className="text-foreground font-bold">{topHabit.target_value} {topHabit.target_unit}</span></span>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((topHabit.current_target / topHabit.target_value) * 100))}%`,
                  background: topHabit.goal.color,
                }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Button
          size="lg"
          onClick={() => onDone(topHabit.id)}
          disabled={loading}
          className="relative animate-pulse-slow"
          style={{ background: topHabit.goal.color, borderColor: topHabit.goal.color } as React.CSSProperties}
        >
          <Zap size={18} />
          Make it So
        </Button>
        <button
          onClick={() => onJustStart(topHabit.id)}
          disabled={loading}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Just start →
        </button>
      </div>
    </div>
  )
}

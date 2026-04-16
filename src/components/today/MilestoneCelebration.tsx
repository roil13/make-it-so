import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '../shared/Button'
import type { Habit, Goal } from '../../types'

export const MILESTONES: Record<number, string> = {
  7:   'One week strong',
  21:  'Habit taking root',
  30:  'One month done',
  66:  'This is who you are now',
  100: 'Legendary',
}

export const MILESTONE_DAYS = Object.keys(MILESTONES).map(Number)

const CELEBRATED_KEY = 'mis_celebrated'

export function getCelebrated(): Record<string, number[]> {
  try { return JSON.parse(localStorage.getItem(CELEBRATED_KEY) ?? '{}') } catch { return {} }
}

export function markCelebrated(habitId: string, days: number) {
  const map = getCelebrated()
  map[habitId] = [...(map[habitId] ?? []), days]
  localStorage.setItem(CELEBRATED_KEY, JSON.stringify(map))
}

interface Props {
  habit: Habit
  goal: Goal
  days: number
  onDismiss: () => void
}

export function MilestoneCelebration({ habit, goal, days, onDismiss }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss after 6s
    const t2 = setTimeout(() => onDismiss(), 6000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDismiss])

  const label = MILESTONES[days] ?? `${days} days`

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: `${goal.color}CC`, backdropFilter: 'blur(12px)' }}
      onClick={onDismiss}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              background: i % 2 === 0 ? '#E8F5E1' : '#48CAE4',
              left: `${(i * 5 + 3) % 100}%`,
              top: `${(i * 7 + 10) % 100}%`,
              animationDuration: `${1.5 + (i % 3) * 0.5}s`,
              animationDelay: `${(i % 5) * 0.2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-6 text-center px-8" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <p
            className="font-black text-[6rem] leading-none select-none animate-pulse-slow"
            style={{ color: '#E8F5E1', textShadow: '0 4px 32px rgba(0,0,0,0.3)' }}
          >
            {days}
          </p>
          <Star className="absolute -top-2 -right-4 text-yellow-300 animate-spin" size={28} style={{ animationDuration: '4s' }} />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#E8F5E1CC' }}>
            {habit.title}
          </p>
          <p className="font-black text-3xl uppercase tracking-widest" style={{ color: '#E8F5E1' }}>
            {label}
          </p>
        </div>

        <Button
          size="lg"
          variant="ghost"
          onClick={onDismiss}
          className="border border-white/30 text-white hover:bg-white/10"
        >
          Keep going →
        </Button>
        <p className="text-xs" style={{ color: '#E8F5E180' }}>Auto-dismisses in a few seconds</p>
      </div>
    </div>
  )
}

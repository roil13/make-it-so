import { Flame } from 'lucide-react'
import clsx from 'clsx'

export function StreakBadge({ streak, className }: { streak: number; className?: string }) {
  if (streak === 0) return null
  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded', streak >= 7 ? 'bg-accent/20 text-accent' : 'bg-surface-2 text-muted', className)}>
      <Flame size={12} className={streak >= 7 ? 'text-accent' : 'text-muted'} />
      {streak}
    </span>
  )
}

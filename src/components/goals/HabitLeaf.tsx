import { CheckCircle2, Circle } from 'lucide-react'
import { StreakBadge } from '../today/StreakBadge'
import type { Habit, HabitLog } from '../../types'

interface Props {
  habit: Habit
  todayLogs: HabitLog[]
}

export function HabitLeaf({ habit, todayLogs }: Props) {
  const done = todayLogs.some((l) => l.habit_id === habit.id)
  const hasTarget = habit.target_value != null && habit.current_target != null
  return (
    <div className="py-2 pl-6 pr-4 rtl:pr-6 rtl:pl-4">
      <div className="flex items-center gap-3">
        {done ? <CheckCircle2 size={16} className="text-success flex-shrink-0" /> : <Circle size={16} className="text-muted flex-shrink-0" />}
        <span className={`text-sm flex-1 ${done ? 'text-muted line-through' : 'text-foreground'}`}>{habit.title}</span>
        {hasTarget && (
          <span className="text-xs text-muted whitespace-nowrap">
            {habit.current_target} / {habit.target_value} {habit.target_unit}
          </span>
        )}
        <StreakBadge streak={habit.active_streak} />
      </div>
    </div>
  )
}

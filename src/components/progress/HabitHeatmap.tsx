import ActivityCalendar from 'react-activity-calendar'
import { subDays } from 'date-fns'
import type { Habit, HabitLog } from '../../types'
import { toDateString } from '../../utils/dates'
import { THEME } from '../../theme'

interface Props {
  habit: Habit
  logs: HabitLog[]
  color: string
}

export function HabitHeatmap({ habit, logs, color }: Props) {
  const completedSet = new Set(
    logs.filter((l) => l.habit_id === habit.id).map((l) => l.completed_date)
  )

  const end = new Date()
  const start = subDays(end, 364)
  const data: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[] = []

  let cursor = new Date(start)
  while (cursor <= end) {
    const dateStr = toDateString(cursor)
    const done = completedSet.has(dateStr)
    data.push({ date: dateStr, count: done ? 1 : 0, level: done ? 4 : 0 })
    cursor = new Date(cursor)
    cursor.setDate(cursor.getDate() + 1)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-foreground font-bold text-sm uppercase tracking-widest mb-4">{habit.title}</p>
      <ActivityCalendar
        data={data}
        theme={{ light: [THEME['surface-2'], color] }}
        hideColorLegend
        hideTotalCount
        blockSize={12}
        blockMargin={3}
        fontSize={11}
      />
    </div>
  )
}

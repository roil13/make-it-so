import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, eachWeekOfInterval, subWeeks, endOfWeek } from 'date-fns'
import type { Habit, HabitLog } from '../../types'
import { toDateString } from '../../utils/dates'
import { THEME } from '../../theme'

interface Props {
  habits: Habit[]
  logs: HabitLog[]
}

export function StreakChart({ habits, logs }: Props) {
  if (habits.length === 0) return null

  const now = new Date()
  const weeks = eachWeekOfInterval({ start: subWeeks(now, 11), end: now })

  const data = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart)
    let total = 0, done = 0
    let cursor = new Date(weekStart)
    while (cursor <= weekEnd && cursor <= now) {
      const dateStr = toDateString(cursor)
      habits.forEach((h) => {
        total++
        if (logs.some((l) => l.habit_id === h.id && l.completed_date === dateStr)) done++
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    return { week: format(weekStart, 'MMM d'), rate: total === 0 ? 0 : Math.round((done / total) * 100) }
  })

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-foreground font-bold text-sm uppercase tracking-widest mb-4">Weekly Completion Rate</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={THEME.accent} stopOpacity={0.3} />
              <stop offset="95%" stopColor={THEME.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="week" tick={{ fill: THEME.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: THEME.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
            labelStyle={{ color: THEME.foreground, fontWeight: 700 }}
            itemStyle={{ color: THEME.accent }}
            formatter={(v: number) => [`${v}%`, 'Completion']}
          />
          <Area type="monotone" dataKey="rate" stroke={THEME.accent} strokeWidth={2} fill="url(#rateGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

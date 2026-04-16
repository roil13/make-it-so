import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Habit, HabitLog, Goal } from '../../types'
import { THEME } from '../../theme'

interface Props {
  habits: Habit[]
  logs: HabitLog[]
  goals: Goal[]
}

export function CompletionRateChart({ habits, logs, goals }: Props) {
  if (habits.length === 0) return null

  const goalMap = new Map(goals.map((g) => [g.id, g]))
  const totalDays = new Set(logs.map((l) => l.completed_date)).size || 1

  const data = habits.map((h) => {
    const done = logs.filter((l) => l.habit_id === h.id).length
    const goal = goalMap.get(h.goal_id)
    return {
      name: h.title.length > 14 ? h.title.slice(0, 14) + '…' : h.title,
      rate: Math.round((done / totalDays) * 100),
      color: goal?.color ?? THEME.accent,
    }
  })

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-foreground font-bold text-sm uppercase tracking-widest mb-4">All-time Completion Rate</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" domain={[0, 100]} tick={{ fill: THEME.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
          <YAxis type="category" dataKey="name" tick={{ fill: THEME.foreground, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
          <Tooltip
            contentStyle={{ background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8 }}
            labelStyle={{ color: THEME.foreground, fontWeight: 700 }}
            itemStyle={{ color: THEME.accent }}
            formatter={(v: number) => [`${v}%`, 'Rate']}
          />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

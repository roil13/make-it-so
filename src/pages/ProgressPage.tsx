import { BarChart2 } from 'lucide-react'
import { subDays } from 'date-fns'
import { useData } from '../contexts/DataContext'
import { useLogsRange } from '../hooks/useLogsRange'
import { HabitHeatmap } from '../components/progress/HabitHeatmap'
import { StreakChart } from '../components/progress/StreakChart'
import { CompletionRateChart } from '../components/progress/CompletionRateChart'
import { EmptyState } from '../components/shared/EmptyState'
import { Spinner } from '../components/shared/Spinner'
import { toDateString } from '../utils/dates'

export function ProgressPage() {
  const { habits, goals, loading: dataLoading } = useData()
  const goalMap = new Map(goals.map((g) => [g.id, g]))

  const endDate = toDateString(new Date())
  const startDate = toDateString(subDays(new Date(), 364))
  const { logs, loading: logsLoading } = useLogsRange(startDate, endDate)

  if (dataLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <EmptyState
        icon={<BarChart2 size={48} />}
        title="No data yet"
        description="Add habits and start logging to see your progress here."
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-foreground font-black text-xl uppercase tracking-widest">Progress</h1>

      <StreakChart habits={habits} logs={logs} />
      <CompletionRateChart habits={habits} logs={logs} goals={goals} />

      <div className="space-y-4">
        <p className="text-muted text-xs uppercase tracking-widest">Habit Heatmaps</p>
        {habits.map((habit) => {
          const goal = goalMap.get(habit.goal_id)
          return (
            <HabitHeatmap
              key={habit.id}
              habit={habit}
              logs={logs}
              color={goal?.color ?? '#2D6A4F'}
            />
          )
        })}
      </div>
    </div>
  )
}

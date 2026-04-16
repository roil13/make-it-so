import { GoalNode } from './GoalNode'
import type { Goal, Habit, HabitLog } from '../../types'

interface Props {
  goals: Goal[]
  habits: Habit[]
  todayLogs: HabitLog[]
}

export function GoalTree({ goals, habits, todayLogs }: Props) {
  return (
    <div className="space-y-3">
      {goals.map((goal) => (
        <GoalNode key={goal.id} goal={goal} habits={habits.filter((h) => h.goal_id === goal.id)} todayLogs={todayLogs} />
      ))}
    </div>
  )
}

import type { Goal, Habit, HabitLog, ScoredHabit } from '../types'

export function scoreHabit(habit: Habit, goal: Goal, todayLogs: HabitLog[]): number {
  const completedToday = todayLogs.some((l) => l.habit_id === habit.id)
  if (completedToday) return -1000

  return (
    goal.priority * 2 +
    habit.priority * 1.5 +
    (habit.active_streak >= 3 ? habit.active_streak * 0.5 : 0)
  )
}

export function getTopPriority(
  habits: Habit[],
  goals: Goal[],
  todayLogs: HabitLog[]
): ScoredHabit | null {
  const goalMap = new Map(goals.map((g) => [g.id, g]))

  const scored = habits
    .filter((h) => !todayLogs.some((l) => l.habit_id === h.id))
    .map((h) => {
      const goal = goalMap.get(h.goal_id)
      if (!goal) return null
      return { ...h, score: scoreHabit(h, goal, todayLogs), goal } as ScoredHabit
    })
    .filter((h): h is ScoredHabit => h !== null)
    .sort((a, b) => b.score - a.score)

  return scored[0] ?? null
}

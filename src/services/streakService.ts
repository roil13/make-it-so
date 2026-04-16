import { parseISO, differenceInCalendarDays } from 'date-fns'
import type { HabitLog } from '../types'
import { toDateString } from '../utils/dates'

export function computeCurrentStreak(logs: HabitLog[], habitId: string): number {
  const completedDates = new Set(
    logs.filter((l) => l.habit_id === habitId).map((l) => l.completed_date)
  )
  let streak = 0
  let cursor = toDateString(new Date())
  while (completedDates.has(cursor)) {
    streak++
    const prev = parseISO(cursor)
    prev.setDate(prev.getDate() - 1)
    cursor = toDateString(prev)
  }
  return streak
}

export function computeLongestStreak(logs: HabitLog[], habitId: string): number {
  const dates = logs
    .filter((l) => l.habit_id === habitId)
    .map((l) => l.completed_date)
    .sort()
  if (dates.length === 0) return 0
  let longest = 1, current = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInCalendarDays(parseISO(dates[i]!), parseISO(dates[i - 1]!))
    if (diff === 1) { current++; if (current > longest) longest = current }
    else current = 1
  }
  return longest
}

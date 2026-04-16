import { useState } from 'react'
import { getISOWeek, getISOWeekYear, parseISO } from 'date-fns'
import { today } from '../utils/dates'

const KEY = 'mis_freezes'

type FreezeMap = Record<string, string> // habitId → date of last freeze

function load(): FreezeMap {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function save(map: FreezeMap) {
  localStorage.setItem(KEY, JSON.stringify(map))
}

function isSameISOWeek(dateStr: string): boolean {
  const d = parseISO(dateStr)
  const now = new Date()
  return getISOWeek(d) === getISOWeek(now) && getISOWeekYear(d) === getISOWeekYear(now)
}

export function useStreakFreeze() {
  const [freezeMap, setFreezeMap] = useState<FreezeMap>(load)

  function canFreeze(habitId: string): boolean {
    const lastDate = freezeMap[habitId]
    if (!lastDate) return true
    return !isSameISOWeek(lastDate)
  }

  function usedFreezeToday(habitId: string): boolean {
    return freezeMap[habitId] === today()
  }

  function recordFreeze(habitId: string) {
    const next = { ...freezeMap, [habitId]: today() }
    save(next)
    setFreezeMap(next)
  }

  return { canFreeze, usedFreezeToday, recordFreeze }
}

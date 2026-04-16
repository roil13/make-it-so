import { useState } from 'react'
import { today } from '../utils/dates'

const KEY = 'mis_started'

interface StartedEntry {
  date: string
  ts: number // timestamp ms
}

type StartedMap = Record<string, StartedEntry>

function load(): StartedMap {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as StartedMap
    // Purge entries from previous days
    const t = today()
    const cleaned: StartedMap = {}
    for (const [id, entry] of Object.entries(raw)) {
      if (entry.date === t) cleaned[id] = entry
    }
    return cleaned
  } catch {
    return {}
  }
}

function save(map: StartedMap) {
  localStorage.setItem(KEY, JSON.stringify(map))
}

export function useJustStart() {
  const [startedMap, setStartedMap] = useState<StartedMap>(load)

  function isStarted(habitId: string): boolean {
    return !!startedMap[habitId]
  }

  function startedAt(habitId: string): number | null {
    return startedMap[habitId]?.ts ?? null
  }

  function start(habitId: string) {
    const next = { ...startedMap, [habitId]: { date: today(), ts: Date.now() } }
    save(next)
    setStartedMap(next)
  }

  function clear(habitId: string) {
    const next = { ...startedMap }
    delete next[habitId]
    save(next)
    setStartedMap(next)
  }

  return { isStarted, startedAt, start, clear }
}

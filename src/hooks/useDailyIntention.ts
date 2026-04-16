import { useState } from 'react'
import { today } from '../utils/dates'

const KEY = 'mis_intention'

function getStoredDate(): string | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw).date ?? null
  } catch {
    return null
  }
}

export function useDailyIntention() {
  const [hasCommitted, setHasCommitted] = useState(() => getStoredDate() === today())

  function commit() {
    localStorage.setItem(KEY, JSON.stringify({ date: today() }))
    setHasCommitted(true)
  }

  return { hasCommitted, commit }
}

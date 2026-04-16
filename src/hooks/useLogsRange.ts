import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchLogsRange } from '../services/logService'
import type { HabitLog } from '../types'

export function useLogsRange(startDate: string, endDate: string) {
  const { user } = useAuth()
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetchLogsRange(user.id, startDate, endDate)
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [user, startDate, endDate])

  return { logs, loading }
}

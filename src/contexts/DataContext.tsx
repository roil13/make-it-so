import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from './AuthContext'
import { today } from '../utils/dates'
import type { Goal, Obstacle, IfThenPlan, MicroStep, MicroStepLog, JournalEntry } from '../types'

interface DataContextValue {
  goals: Goal[]
  obstacles: Obstacle[]
  ifThenPlans: IfThenPlan[]
  microSteps: MicroStep[]
  todayLogs: MicroStepLog[]
  todayJournal: JournalEntry | null
  loading: boolean
  refetch: () => Promise<void>
}

const DataContext = createContext<DataContextValue>({
  goals: [],
  obstacles: [],
  ifThenPlans: [],
  microSteps: [],
  todayLogs: [],
  todayJournal: null,
  loading: true,
  refetch: async () => {},
})

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [ifThenPlans, setIfThenPlans] = useState<IfThenPlan[]>([])
  const [microSteps, setMicroSteps] = useState<MicroStep[]>([])
  const [todayLogs, setTodayLogs] = useState<MicroStepLog[]>([])
  const [todayJournal, setTodayJournal] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!user) return
    const todayStr = today()
    const [goalsRes, obstaclesRes, plansRes, stepsRes, logsRes, journalRes] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).order('priority', { ascending: false }),
      supabase.from('obstacles').select('*').eq('user_id', user.id).order('order_index', { ascending: true }),
      supabase.from('if_then_plans').select('*').eq('user_id', user.id),
      supabase.from('micro_steps').select('*').eq('user_id', user.id),
      supabase.from('micro_step_logs').select('*').eq('user_id', user.id).eq('completed_date', todayStr),
      supabase.from('journal_entries').select('*').eq('user_id', user.id).eq('entry_date', todayStr).maybeSingle(),
    ])
    if (goalsRes.data) setGoals(goalsRes.data)
    if (obstaclesRes.data) setObstacles(obstaclesRes.data)
    if (plansRes.data) setIfThenPlans(plansRes.data)
    if (stepsRes.data) setMicroSteps(stepsRes.data)
    if (logsRes.data) setTodayLogs(logsRes.data)
    setTodayJournal(journalRes.data ?? null)
  }, [user])

  useEffect(() => {
    if (!user) {
      setGoals([]); setObstacles([]); setIfThenPlans([]); setMicroSteps([])
      setTodayLogs([]); setTodayJournal(null); setLoading(false)
      return
    }

    setLoading(true)
    fetchAll().finally(() => setLoading(false))

    const todayStr = today()
    const channel = supabase
      .channel(`data-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('goals').select('*').eq('user_id', user.id).order('priority', { ascending: false })
          .then(({ data }) => { if (data) setGoals(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'obstacles', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('obstacles').select('*').eq('user_id', user.id).order('order_index', { ascending: true })
          .then(({ data }) => { if (data) setObstacles(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'if_then_plans', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('if_then_plans').select('*').eq('user_id', user.id)
          .then(({ data }) => { if (data) setIfThenPlans(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'micro_steps', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('micro_steps').select('*').eq('user_id', user.id)
          .then(({ data }) => { if (data) setMicroSteps(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'micro_step_logs', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('micro_step_logs').select('*').eq('user_id', user.id).eq('completed_date', todayStr)
          .then(({ data }) => { if (data) setTodayLogs(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entries', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('journal_entries').select('*').eq('user_id', user.id).eq('entry_date', todayStr).maybeSingle()
          .then(({ data }) => { setTodayJournal(data ?? null) })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, fetchAll])

  return (
    <DataContext.Provider value={{ goals, obstacles, ifThenPlans, microSteps, todayLogs, todayJournal, loading, refetch: fetchAll }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}

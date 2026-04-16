import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from './AuthContext'
import { today } from '../utils/dates'
import type { Goal, Habit, HabitLog, Project, Task } from '../types'

interface DataContextValue {
  goals: Goal[]
  habits: Habit[]
  todayLogs: HabitLog[]
  projects: Project[]
  tasks: Task[]
  loading: boolean
  refetch: () => Promise<void>
}

const DataContext = createContext<DataContextValue>({
  goals: [],
  habits: [],
  todayLogs: [],
  projects: [],
  tasks: [],
  loading: true,
  refetch: async () => {},
})

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!user) return
    const todayStr = today()
    const [goalsRes, habitsRes, logsRes, projectsRes, tasksRes] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).order('priority', { ascending: false }),
      supabase.from('habits').select('*').eq('user_id', user.id).order('priority', { ascending: false }),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('completed_date', todayStr),
      supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('tasks').select('*').eq('user_id', user.id).order('order_index', { ascending: true }),
    ])
    if (goalsRes.data) setGoals(goalsRes.data)
    if (habitsRes.data) setHabits(habitsRes.data)
    if (logsRes.data) setTodayLogs(logsRes.data)
    if (projectsRes.data) setProjects(projectsRes.data)
    if (tasksRes.data) setTasks(tasksRes.data)
  }, [user])

  useEffect(() => {
    if (!user) {
      setGoals([]); setHabits([]); setTodayLogs([]); setProjects([]); setTasks([]); setLoading(false)
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habits', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('habits').select('*').eq('user_id', user.id).order('priority', { ascending: false })
          .then(({ data }) => { if (data) setHabits(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('habit_logs').select('*').eq('user_id', user.id).eq('completed_date', todayStr)
          .then(({ data }) => { if (data) setTodayLogs(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('projects').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
          .then(({ data }) => { if (data) setProjects(data) })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` }, () => {
        supabase.from('tasks').select('*').eq('user_id', user.id).order('order_index', { ascending: true })
          .then(({ data }) => { if (data) setTasks(data) })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, fetchAll])

  return (
    <DataContext.Provider value={{ goals, habits, todayLogs, projects, tasks, loading, refetch: fetchAll }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}

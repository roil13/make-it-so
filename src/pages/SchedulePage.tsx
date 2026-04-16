import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Settings2 } from 'lucide-react'
import { addDays, subDays } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useCalendar } from '../contexts/CalendarContext'
import { fetchOverrides, upsertOverride } from '../services/scheduleService'
import { DayTimeline } from '../components/schedule/DayTimeline'
import { CalendarSettings, useCalendarAvailable } from '../components/schedule/CalendarSettings'
import { Spinner } from '../components/shared/Spinner'
import { toDateString, formatDisplayDate } from '../utils/dates'
import type { ScheduleOverride } from '../types'
import type { TimeBlockData } from '../components/schedule/TimeBlock'
import { THEME } from '../theme'
import { createGoogleEvent } from '../services/googleCalendarService'
import { createMicrosoftEvent } from '../services/microsoftCalendarService'

export function SchedulePage() {
  const { user } = useAuth()
  const { habits, tasks, goals, projects, todayLogs } = useData()
  const {
    events: calendarEvents, fetchEventsForDate,
    googleConnected, googleMode,
    microsoftConnected, microsoftMode,
  } = useCalendar()
  const calendarAvailable = useCalendarAvailable()
  const [date, setDate] = useState(new Date())
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([])
  const [loading, setLoading] = useState(false)
  const [showCalSettings, setShowCalSettings] = useState(false)

  const dateStr = toDateString(date)
  const goalMap = new Map(goals.map((g) => [g.id, g]))
  const projectMap = new Map(projects.map((p) => [p.id, p]))

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetchOverrides(user.id, dateStr)
      .then(setOverrides)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, dateStr])

  useEffect(() => {
    fetchEventsForDate(dateStr)
  }, [dateStr])

  // Read+Write sync: push scheduled habits/tasks to connected calendars once per date
  useEffect(() => {
    const scheduledItems = [
      ...habits.filter((h) => h.scheduled_time),
      ...tasks.filter((t) => t.status !== 'done' && t.scheduled_time),
    ]
    if (scheduledItems.length === 0) return

    async function syncToCalendar(provider: 'google' | 'microsoft', token: string | null) {
      if (!token) return
      const syncKey = `mis_synced_${provider}_${dateStr}`
      if (localStorage.getItem(syncKey)) return
      for (const item of scheduledItems) {
        const timeStr = 'goal_id' in item ? item.scheduled_time! : item.scheduled_time!
        const duration = item.duration_minutes ?? 30
        const [h, m] = timeStr.split(':').map(Number)
        const start = new Date(`${dateStr}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`)
        const end = new Date(start.getTime() + duration * 60000)
        try {
          if (provider === 'google') {
            await createGoogleEvent(token, item.title, dateStr, `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, duration)
          } else {
            await createMicrosoftEvent(token, item.title, dateStr, `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, duration)
          }
        } catch {
          // ignore per-event errors; don't block the UI
        }
        void start; void end
      }
      localStorage.setItem(syncKey, '1')
    }

    const gcalToken = googleConnected && googleMode === 'readwrite'
      ? localStorage.getItem('mis_gcal_token') : null
    const msToken = microsoftConnected && microsoftMode === 'readwrite'
      ? localStorage.getItem('mis_mscal_token') : null

    if (gcalToken) syncToCalendar('google', gcalToken)
    if (msToken) syncToCalendar('microsoft', msToken)
  }, [dateStr, habits, tasks, googleConnected, googleMode, microsoftConnected, microsoftMode])

  function getEffectiveTime(itemType: 'habit' | 'task', itemId: string, defaultTime: string | null): number | null {
    const override = overrides.find((o) => o.item_type === itemType && o.item_id === itemId)
    const timeStr = override?.start_time ?? defaultTime
    if (!timeStr) return null
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  function getEffectiveDuration(itemType: 'habit' | 'task', itemId: string, defaultDuration: number | null): number {
    const override = overrides.find((o) => o.item_type === itemType && o.item_id === itemId)
    return override?.duration_minutes ?? defaultDuration ?? 30
  }

  // Build scheduled blocks
  const scheduledBlocks: TimeBlockData[] = []
  const unscheduledBlocks: TimeBlockData[] = []

  habits.forEach((habit) => {
    const goal = goalMap.get(habit.goal_id)
    const startMin = getEffectiveTime('habit', habit.id, habit.scheduled_time)
    const duration = getEffectiveDuration('habit', habit.id, habit.duration_minutes)
    const isDone = todayLogs.some((l) => l.habit_id === habit.id)
    const block: TimeBlockData = {
      id: habit.id,
      itemType: 'habit',
      title: habit.title,
      subtitle: goal?.title,
      color: goal?.color ?? THEME.accent,
      startMinutes: startMin ?? 0,
      durationMinutes: duration,
      isDone,
    }
    if (startMin !== null) scheduledBlocks.push(block)
    else unscheduledBlocks.push(block)
  })

  tasks
    .filter((t) => t.status !== 'done')
    .forEach((task) => {
      const project = projectMap.get(task.project_id)
      const goal = project ? goalMap.get(project.goal_id) : undefined
      const startMin = getEffectiveTime('task', task.id, task.scheduled_time)
      const duration = getEffectiveDuration('task', task.id, task.duration_minutes)
      const block: TimeBlockData = {
        id: task.id,
        itemType: 'task',
        title: task.title,
        subtitle: project?.title,
        color: goal?.color ?? THEME.water,
        startMinutes: startMin ?? 0,
        durationMinutes: duration,
      }
      if (startMin !== null) scheduledBlocks.push(block)
      else unscheduledBlocks.push(block)
    })

  // Add calendar events as blocks
  calendarEvents.forEach((evt) => {
    const start = new Date(evt.start)
    const end = new Date(evt.end)
    const startMin = start.getHours() * 60 + start.getMinutes()
    const duration = Math.round((end.getTime() - start.getTime()) / 60000)
    scheduledBlocks.push({
      id: evt.id,
      itemType: 'calendar',
      title: evt.title,
      subtitle: evt.provider === 'google' ? 'Google Calendar' : 'Outlook',
      color: evt.color,
      startMinutes: startMin,
      durationMinutes: duration,
    })
  })

  async function handleReschedule(blockId: string, itemType: 'habit' | 'task', newStartMinutes: number) {
    if (!user) return
    const h = Math.floor(newStartMinutes / 60)
    const m = newStartMinutes % 60
    const newTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`

    // Find existing duration
    const existingOverride = overrides.find((o) => o.item_type === itemType && o.item_id === blockId)
    let duration = existingOverride?.duration_minutes
    if (!duration) {
      if (itemType === 'habit') {
        duration = habits.find((h) => h.id === blockId)?.duration_minutes ?? 30
      } else {
        duration = tasks.find((t) => t.id === blockId)?.duration_minutes ?? 30
      }
    }

    await upsertOverride(user.id, itemType, blockId, dateStr, newTime, duration)
    const updated = await fetchOverrides(user.id, dateStr)
    setOverrides(updated)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-foreground font-black text-xl uppercase tracking-widest">Schedule</h1>
        {calendarAvailable && (
          <button
            onClick={() => setShowCalSettings((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground uppercase tracking-widest transition-colors"
          >
            <Settings2 size={14} />
            Calendars
          </button>
        )}
      </div>

      {/* Calendar settings panel */}
      {showCalSettings && <CalendarSettings />}

      {/* Date navigation */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3">
        <button onClick={() => setDate((d) => subDays(d, 1))} className="text-muted hover:text-foreground transition-colors p-1">
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-accent" />
          <span className="text-foreground font-bold text-sm">{formatDisplayDate(dateStr)}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setDate(new Date())} className="text-xs text-accent uppercase tracking-widest px-2 py-1 hover:bg-accent/10 rounded transition-colors">
            Today
          </button>
          <button onClick={() => setDate((d) => addDays(d, 1))} className="text-muted hover:text-foreground transition-colors p-1">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <DayTimeline
          blocks={scheduledBlocks}
          unscheduled={unscheduledBlocks}
          calendarEvents={calendarEvents}
          onReschedule={handleReschedule}
        />
      )}
    </div>
  )
}

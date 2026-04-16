import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { HabitLeaf } from './HabitLeaf'
import type { Goal, Habit, HabitLog } from '../../types'

interface Props {
  goal: Goal
  habits: Habit[]
  todayLogs: HabitLog[]
}

export function GoalNode({ goal, habits, todayLogs }: Props) {
  const [open, setOpen] = useState(true)
  const done = habits.filter((h) => todayLogs.some((l) => l.habit_id === h.id)).length

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: goal.color }} />
        <span className="font-bold text-foreground text-sm uppercase tracking-widest flex-1 text-left rtl:text-right">{goal.title}</span>
        <span className="text-xs text-muted mr-2 rtl:mr-0 rtl:ml-2">{done}/{habits.length} today</span>
        {open ? <ChevronDown size={16} className="text-muted" /> : <ChevronRight size={16} className="text-muted" />}
      </button>
      {open && habits.length > 0 && (
        <div className="border-t border-border divide-y divide-border">
          {habits.map((h) => <HabitLeaf key={h.id} habit={h} todayLogs={todayLogs} />)}
        </div>
      )}
      {open && habits.length === 0 && (
        <div className="border-t border-border px-6 py-3 text-xs text-muted">No habits linked to this goal yet.</div>
      )}
    </div>
  )
}

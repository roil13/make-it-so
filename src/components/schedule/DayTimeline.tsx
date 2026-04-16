import { useRef } from 'react'
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { TimeBlock, type TimeBlockData } from './TimeBlock'
import type { CalendarEvent } from '../../types'

const START_HOUR = 6    // 6 AM
const END_HOUR   = 24   // midnight
const TOTAL_HOURS = END_HOUR - START_HOUR
const HOUR_HEIGHT = 64  // px

interface Props {
  blocks: TimeBlockData[]
  unscheduled: TimeBlockData[]
  calendarEvents: CalendarEvent[]
  onReschedule: (blockId: string, itemType: 'habit' | 'task', newStartMinutes: number) => void
}

export function DayTimeline({ blocks, unscheduled, onReschedule }: Props) {
  const timelineRef = useRef<HTMLDivElement>(null)

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event
    const data = active.data.current as TimeBlockData
    if (!data || data.itemType === 'calendar') return

    // Convert pixel delta to minutes, snap to 15-min grid
    const deltaMinutes = Math.round((delta.y / HOUR_HEIGHT) * 60 / 15) * 15
    const newStart = Math.max(
      START_HOUR * 60,
      Math.min((END_HOUR * 60) - data.durationMinutes, data.startMinutes + deltaMinutes)
    )
    onReschedule(data.id, data.itemType, newStart)
  }

  return (
    <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
      {/* Unscheduled tray */}
      {unscheduled.length > 0 && (
        <div className="mb-4">
          <p className="text-muted text-xs uppercase tracking-widest mb-2">Unscheduled</p>
          <div className="flex flex-wrap gap-2">
            {unscheduled.map((b) => (
              <UnscheduledChip key={b.id} block={b} />
            ))}
          </div>
        </div>
      )}

      {/* Timeline grid */}
      <div className="relative overflow-y-auto" style={{ height: '70vh' }}>
        <div
          ref={timelineRef}
          className="relative"
          style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
        >
          {/* Hour gridlines */}
          {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
            const hour = START_HOUR + i
            return (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-border/40 flex items-start"
                style={{ top: i * HOUR_HEIGHT }}
              >
                <span className="text-[10px] text-muted w-10 pl-1 -translate-y-2 select-none">
                  {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                </span>
              </div>
            )
          })}

          {/* Current time indicator */}
          <CurrentTimeLine startHour={START_HOUR} hourHeight={HOUR_HEIGHT} />

          {/* Scheduled blocks */}
          <div className="absolute left-12 right-0 top-0 bottom-0">
            {blocks.map((block) => (
              <TimeBlock key={block.id} block={block} startHour={START_HOUR} />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  )
}

function UnscheduledChip({ block }: { block: TimeBlockData }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: block.id, data: block })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-grab text-xs font-bold"
      style={{ borderColor: block.color, color: block.color, background: `${block.color}18` }}
    >
      {block.title}
    </div>
  )
}

function CurrentTimeLine({ startHour, hourHeight }: { startHour: number; hourHeight: number }) {
  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  const top = ((minutes - startHour * 60) / 60) * hourHeight
  if (top < 0 || top > (END_HOUR - startHour) * hourHeight) return null
  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top }}>
      <div className="flex items-center">
        <div className="w-2 h-2 rounded-full bg-accent ml-8 flex-shrink-0" />
        <div className="flex-1 h-px bg-accent" />
      </div>
    </div>
  )
}

// Re-export for use in SchedulePage drop zone
export { useDroppable }
export const TIMELINE_HOUR_HEIGHT = HOUR_HEIGHT
export const TIMELINE_START_HOUR = START_HOUR

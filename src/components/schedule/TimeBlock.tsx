import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'

export interface TimeBlockData {
  id: string
  itemType: 'habit' | 'task' | 'calendar'
  title: string
  subtitle?: string
  color: string
  startMinutes: number   // minutes from midnight
  durationMinutes: number
  isDone?: boolean
}

const HOUR_HEIGHT = 64 // px per hour — matches DayTimeline

interface Props {
  block: TimeBlockData
  startHour: number  // timeline start (e.g. 6)
}

export function TimeBlock({ block, startHour }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    data: block,
    disabled: block.itemType === 'calendar',
  })

  const topPx = ((block.startMinutes - startHour * 60) / 60) * HOUR_HEIGHT
  const heightPx = Math.max(24, (block.durationMinutes / 60) * HOUR_HEIGHT)

  const style = {
    top: topPx,
    height: heightPx,
    transform: CSS.Translate.toString(transform),
    borderLeftColor: block.color,
    background: `${block.color}22`,
    zIndex: isDragging ? 50 : 10,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={clsx(
        'absolute left-1 right-1 rounded-lg border-l-4 px-2 py-1 overflow-hidden',
        'transition-shadow select-none',
        block.itemType === 'calendar' ? 'cursor-default opacity-70' : 'cursor-grab active:cursor-grabbing',
        isDragging && 'shadow-2xl opacity-90',
        block.isDone && 'opacity-40'
      )}
    >
      <p className="text-xs font-bold truncate" style={{ color: block.color }}>
        {block.title}
      </p>
      {block.subtitle && (
        <p className="text-[10px] text-muted truncate">{block.subtitle}</p>
      )}
      <p className="text-[10px] text-muted">
        {formatMinutes(block.startMinutes)} · {block.durationMinutes}m
      </p>
    </div>
  )
}

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

import { THEME } from '../../theme'

interface Props {
  done: number
  total: number
}

export function CompletionRing({ done, total }: Props) {
  const pct = total === 0 ? 0 : done / total
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)
  const allDone = done === total && total > 0

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke={THEME.border} strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={allDone ? THEME.success : THEME.accent}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <span className="text-foreground font-black text-sm" style={{ marginTop: '-52px', position: 'relative', zIndex: 1 }}>
        {done}/{total}
      </span>
    </div>
  )
}

import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-muted mb-4 opacity-40">{icon}</div>
      <p className="text-foreground font-bold text-lg uppercase tracking-widest mb-1">{title}</p>
      {description && <p className="text-muted text-sm mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

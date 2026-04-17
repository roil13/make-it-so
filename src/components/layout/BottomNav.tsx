import { NavLink } from 'react-router-dom'
import { Zap, Target, Lightbulb, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

const nav = [
  { to: '/today',   icon: Zap,       labelKey: 'nav.today'   },
  { to: '/goals',   icon: Target,    labelKey: 'nav.goals'   },
  { to: '/plans',   icon: Lightbulb, labelKey: 'nav.plans'   },
  { to: '/journal', icon: BookOpen,  labelKey: 'nav.journal' },
]

export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border flex md:hidden pb-safe">
      {nav.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            clsx(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors',
              isActive ? 'text-accent' : 'text-muted'
            )
          }
        >
          <Icon size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}

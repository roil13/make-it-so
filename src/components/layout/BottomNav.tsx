import { NavLink } from 'react-router-dom'
import { Zap, Target, BarChart2, Settings, CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

export function BottomNav() {
  const { t } = useTranslation()

  const nav = [
    { to: '/today',    icon: Zap,          label: t('nav.today') },
    { to: '/goals',    icon: Target,       label: t('nav.goals') },
    { to: '/schedule', icon: CalendarDays, label: t('nav.schedule') },
    { to: '/progress', icon: BarChart2,    label: t('nav.progress') },
    { to: '/manage',   icon: Settings,     label: t('nav.manage') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border flex md:hidden pb-safe">
      {nav.map(({ to, icon: Icon, label }) => (
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
          <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

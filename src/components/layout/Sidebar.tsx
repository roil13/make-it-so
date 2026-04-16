import { NavLink } from 'react-router-dom'
import { Zap, Target, BarChart2, Settings, CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

export function Sidebar() {
  const { t } = useTranslation()

  const nav = [
    { to: '/today',    icon: Zap,          label: t('nav.today') },
    { to: '/goals',    icon: Target,       label: t('nav.goals') },
    { to: '/schedule', icon: CalendarDays, label: t('nav.schedule') },
    { to: '/progress', icon: BarChart2,    label: t('nav.progress') },
    { to: '/manage',   icon: Settings,     label: t('nav.manage') },
  ]

  return (
    <aside className="w-16 md:w-56 flex-shrink-0 bg-surface border-r border-border rtl:border-r-0 rtl:border-l flex flex-col py-6">
      <div className="px-4 mb-8 hidden md:block">
        <span className="text-accent font-black text-lg uppercase tracking-widest">Make it So</span>
      </div>
      <div className="px-2 mb-8 md:hidden flex justify-center">
        <Zap className="text-accent" size={24} />
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-muted hover:text-foreground hover:bg-surface-2'
              )
            }
          >
            <Icon size={18} />
            <span className="hidden md:block text-sm font-bold uppercase tracking-widest">
              {label}
            </span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

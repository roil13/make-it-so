import { NavLink } from 'react-router-dom'
import { Zap, Target, Lightbulb, BookOpen, HelpCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

const nav = [
  { to: '/today',   icon: Zap,       labelKey: 'nav.today'   },
  { to: '/goals',   icon: Target,    labelKey: 'nav.goals'   },
  { to: '/plans',   icon: Lightbulb, labelKey: 'nav.plans'   },
  { to: '/journal', icon: BookOpen,  labelKey: 'nav.journal' },
]

interface Props {
  onOpenTour: () => void
}

export function Sidebar({ onOpenTour }: Props) {
  const { t } = useTranslation()

  return (
    <aside className="w-16 md:w-56 flex-shrink-0 bg-surface border-r border-border rtl:border-r-0 rtl:border-l flex flex-col py-6">
      <div className="px-4 mb-8 hidden md:block">
        <span className="text-accent font-black text-lg uppercase tracking-widest">Make it So</span>
      </div>
      <div className="px-2 mb-8 md:hidden flex justify-center">
        <Zap className="text-accent" size={24} />
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {nav.map(({ to, icon: Icon, labelKey }) => (
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
              {t(labelKey)}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Help / Tutorial button */}
      <div className="px-2 pt-4 border-t border-border mt-4">
        <button
          onClick={onOpenTour}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-colors text-muted hover:text-foreground hover:bg-surface-2"
        >
          <HelpCircle size={18} />
          <span className="hidden md:block text-sm font-bold uppercase tracking-widest">{t('nav.guide')}</span>
        </button>
      </div>
    </aside>
  )
}

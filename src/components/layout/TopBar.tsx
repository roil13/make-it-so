import { LogOut, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../supabase/client'
import { useAuth } from '../../contexts/AuthContext'
import { formatDisplayDate, today } from '../../utils/dates'

export function TopBar() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const isHe = i18n.language === 'he'

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-surface flex-shrink-0">
      <span className="text-muted text-sm font-medium">
        {formatDisplayDate(today())}
      </span>
      <div className="flex items-center gap-3">
        {/* Language switcher */}
        <div className="flex rounded-lg border border-border overflow-hidden text-xs font-bold">
          <button
            onClick={() => i18n.changeLanguage('en')}
            className={`px-2.5 py-1 transition-colors ${!isHe ? 'bg-accent text-on-accent' : 'text-muted hover:text-foreground'}`}
          >
            EN
          </button>
          <button
            onClick={() => i18n.changeLanguage('he')}
            className={`px-2.5 py-1 transition-colors ${isHe ? 'bg-accent text-on-accent' : 'text-muted hover:text-foreground'}`}
          >
            HE
          </button>
        </div>

        <div className="flex items-center gap-2 text-muted text-sm">
          <User size={14} />
          <span className="hidden md:block">{user?.email}</span>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-muted hover:text-foreground transition-colors"
          title={t('topbar.signOut')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}

import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { upsertJournalEntry } from '../../services/journalService'
import { useAuth } from '../../contexts/AuthContext'
import { today } from '../../utils/dates'
import type { JournalEntry } from '../../types'

interface DailyPromptProps {
  existingEntry: JournalEntry | null
  onSaved: () => void
}

export function DailyPrompt({ existingEntry, onSaved }: DailyPromptProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [text, setText] = useState(existingEntry?.content ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!user || !text.trim()) return
    setSaving(true)
    try {
      await upsertJournalEntry(user.id, today(), text.trim())
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-accent" />
        </div>
        <div>
          <p className="text-foreground font-bold text-sm">{t('journal.promptTitle')}</p>
          <p className="text-muted text-xs">{t('journal.promptSubtitle')}</p>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('journal.promptPlaceholder')}
        rows={3}
        maxLength={10000}
        className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
      />
      <div className="flex items-center justify-between">
        <p className="text-muted text-xs">{existingEntry ? t('journal.alreadyLogged') : ''}</p>
        <button
          onClick={handleSave}
          disabled={saving || !text.trim()}
          className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saved ? t('common.saved') : saving ? t('common.saving') : existingEntry ? t('common.update') : t('journal.logWin')}
        </button>
      </div>
    </div>
  )
}

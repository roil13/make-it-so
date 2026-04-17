import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { fetchJournalEntries } from '../services/journalService'
import { DailyPrompt } from '../components/journal/DailyPrompt'
import { JournalEntryCard } from '../components/journal/JournalEntryCard'
import { EmptyState } from '../components/shared/EmptyState'
import { Spinner } from '../components/shared/Spinner'
import type { JournalEntry } from '../types'

export function JournalPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { todayJournal, refetch: refetchData } = useData()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(true)

  async function loadEntries() {
    if (!user) return
    setLoadingEntries(true)
    try {
      const data = await fetchJournalEntries(user.id)
      setEntries(data)
    } finally {
      setLoadingEntries(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [user])

  async function handleSaved() {
    await Promise.all([refetchData(), loadEntries()])
  }

  // Count entries in the last 7 days
  const recentCount = entries.filter((e) => {
    const d = new Date(e.entry_date)
    const diff = (Date.now() - d.getTime()) / 86400000
    return diff <= 7
  }).length

  // Past entries exclude today
  const pastEntries = entries.filter((e) => e.entry_date !== new Date().toISOString().split('T')[0])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground font-black text-xl uppercase tracking-widest">{t('journal.title')}</h1>
        {entries.length > 0 && (
          <p className="text-muted text-xs">
            <span className="text-accent font-bold">{recentCount}</span> {t('journal.entriesThisWeek')}
          </p>
        )}
      </div>

      {/* Today's prompt */}
      <DailyPrompt existingEntry={todayJournal} onSaved={handleSaved} />

      {/* Past entries */}
      {loadingEntries ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : pastEntries.length === 0 ? (
        entries.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={48} />}
            title={t('journal.empty')}
            description={t('journal.emptyDesc')}
          />
        ) : null
      ) : (
        <div className="space-y-3">
          <p className="text-muted text-xs uppercase tracking-widest">{t('journal.pastEntries')}</p>
          {pastEntries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} onRefetch={loadEntries} />
          ))}
        </div>
      )}
    </div>
  )
}

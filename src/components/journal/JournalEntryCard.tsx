import { useState } from 'react'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { upsertJournalEntry, deleteJournalEntry } from '../../services/journalService'
import { useAuth } from '../../contexts/AuthContext'
import type { JournalEntry } from '../../types'
import { formatDisplayDate } from '../../utils/dates'

interface JournalEntryCardProps {
  entry: JournalEntry
  onRefetch: () => void
}

export function JournalEntryCard({ entry, onRefetch }: JournalEntryCardProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(entry.content)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!user || !text.trim()) return
    setSaving(true)
    try {
      await upsertJournalEntry(user.id, entry.entry_date, text.trim())
      setEditing(false)
      onRefetch()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(t('journal.confirmDelete'))) return
    await deleteJournalEntry(entry.id)
    onRefetch()
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-muted text-xs uppercase tracking-widest">{formatDisplayDate(entry.entry_date)}</p>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!editing && (
            <>
              <button onClick={() => setEditing(true)} className="text-muted hover:text-foreground transition-colors p-1">
                <Pencil size={12} />
              </button>
              <button onClick={handleDelete} className="text-muted hover:text-danger transition-colors p-1">
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            autoFocus
            className="w-full bg-background border border-border rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent resize-none"
          />
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-success text-xs font-bold uppercase tracking-widest hover:opacity-80">
              <Check size={12} /> {saving ? t('common.saving') : t('common.save')}
            </button>
            <button onClick={() => { setEditing(false); setText(entry.content) }} className="flex items-center gap-1 text-muted text-xs uppercase tracking-widest hover:text-foreground">
              <X size={12} /> {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-foreground text-sm leading-relaxed">{entry.content}</p>
      )}
    </div>
  )
}

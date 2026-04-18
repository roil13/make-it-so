import { supabase } from '../supabase/client'
import type { JournalEntry } from '../types'

export async function upsertJournalEntry(userId: string, entryDate: string, content: string): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .upsert({ user_id: userId, entry_date: entryDate, content }, { onConflict: 'user_id,entry_date' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchJournalEntries(userId: string, limit = 30): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function deleteJournalEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', entryId)
  if (error) throw error
}

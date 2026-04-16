import type { CalendarEvent } from '../types'

const BASE = 'https://www.googleapis.com/calendar/v3'

export async function fetchGoogleEvents(token: string, date: string): Promise<CalendarEvent[]> {
  const dayStart = new Date(`${date}T00:00:00`)
  const dayEnd   = new Date(`${date}T23:59:59`)
  const params = new URLSearchParams({
    timeMin:      dayStart.toISOString(),
    timeMax:      dayEnd.toISOString(),
    singleEvents: 'true',
    orderBy:      'startTime',
  })
  const res = await fetch(`${BASE}/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Google Calendar fetch failed: ${res.status}`)
  const json = await res.json()
  return (json.items ?? []).map((item: GoogleEvent) => ({
    id:       item.id,
    title:    item.summary ?? '(no title)',
    start:    item.start?.dateTime ?? item.start?.date ?? date,
    end:      item.end?.dateTime   ?? item.end?.date   ?? date,
    provider: 'google' as const,
    color:    '#4285F4',
  }))
}

export async function createGoogleEvent(
  token: string,
  title: string,
  date: string,
  startTime: string, // "HH:MM"
  durationMinutes: number
): Promise<string> {
  const start = new Date(`${date}T${startTime}:00`)
  const end   = new Date(start.getTime() + durationMinutes * 60000)
  const res = await fetch(`${BASE}/calendars/primary/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: title,
      start: { dateTime: start.toISOString() },
      end:   { dateTime: end.toISOString() },
    }),
  })
  if (!res.ok) throw new Error(`Google Calendar create failed: ${res.status}`)
  const json = await res.json()
  return json.id
}

export async function deleteGoogleEvent(token: string, eventId: string): Promise<void> {
  await fetch(`${BASE}/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function fetchGoogleUserEmail(token: string): Promise<string> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  return json.email ?? ''
}

interface GoogleEvent {
  id: string
  summary?: string
  start?: { dateTime?: string; date?: string }
  end?:   { dateTime?: string; date?: string }
}

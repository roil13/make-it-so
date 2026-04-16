import type { CalendarEvent } from '../types'

const BASE = 'https://graph.microsoft.com/v1.0/me'

export async function fetchMicrosoftEvents(token: string, date: string): Promise<CalendarEvent[]> {
  const dayStart = new Date(`${date}T00:00:00`)
  const dayEnd   = new Date(`${date}T23:59:59`)
  const params = new URLSearchParams({
    startDateTime: dayStart.toISOString(),
    endDateTime:   dayEnd.toISOString(),
    $orderby:      'start/dateTime',
    $top:          '50',
  })
  const res = await fetch(`${BASE}/calendarView?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Microsoft Calendar fetch failed: ${res.status}`)
  const json = await res.json()
  return (json.value ?? []).map((item: MSEvent) => ({
    id:       item.id,
    title:    item.subject ?? '(no title)',
    start:    item.start?.dateTime ?? date,
    end:      item.end?.dateTime   ?? date,
    provider: 'microsoft' as const,
    color:    '#0078D4',
  }))
}

export async function createMicrosoftEvent(
  token: string,
  title: string,
  date: string,
  startTime: string,
  durationMinutes: number
): Promise<string> {
  const start = new Date(`${date}T${startTime}:00`)
  const end   = new Date(start.getTime() + durationMinutes * 60000)
  const res = await fetch(`${BASE}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: title,
      start: { dateTime: start.toISOString(), timeZone: 'UTC' },
      end:   { dateTime: end.toISOString(),   timeZone: 'UTC' },
    }),
  })
  if (!res.ok) throw new Error(`Microsoft Calendar create failed: ${res.status}`)
  const json = await res.json()
  return json.id
}

export async function fetchMicrosoftUserEmail(token: string): Promise<string> {
  const res = await fetch(`${BASE}?$select=mail,userPrincipalName`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  return json.mail ?? json.userPrincipalName ?? ''
}

interface MSEvent {
  id: string
  subject?: string
  start?: { dateTime?: string }
  end?:   { dateTime?: string }
}

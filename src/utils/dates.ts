import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns'

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function today(): string {
  return toDateString(new Date())
}

export function yesterday(): string {
  return toDateString(subDays(new Date(), 1))
}

export function isToday(dateStr: string): boolean {
  return dateStr === today()
}

export function getDateRange(start: string, end: string): string[] {
  return eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  }).map(toDateString)
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE, MMMM d')
}

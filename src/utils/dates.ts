import { format, isAfter, isBefore, parseISO, differenceInMinutes, differenceInHours } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatMatchDate(dateStr: string): string {
  return format(parseISO(dateStr), "EEEE d 'de' MMMM", { locale: es })
}

export function formatMatchTime(dateStr: string): string {
  return format(parseISO(dateStr), 'HH:mm')
}

export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM', { locale: es })
}

export function formatFullDate(dateStr: string): string {
  return format(parseISO(dateStr), "d 'de' MMMM 'de' yyyy", { locale: es })
}

export function isMatchOpen(matchDate: string): boolean {
  return isBefore(new Date(), parseISO(matchDate))
}

export function isMatchPast(matchDate: string): boolean {
  return isAfter(new Date(), parseISO(matchDate))
}

export function timeUntilMatch(matchDate: string): string {
  const now = new Date()
  const date = parseISO(matchDate)
  const diffMins = differenceInMinutes(date, now)
  const diffHours = differenceInHours(date, now)

  if (diffMins < 0) return 'Finalizado'
  if (diffMins < 60) return `En ${diffMins} min`
  if (diffHours < 24) return `En ${diffHours}h`
  const days = Math.floor(diffHours / 24)
  return `En ${days} día${days !== 1 ? 's' : ''}`
}

export function groupMatchesByDate(matches: { match_date: string }[]): Map<string, typeof matches> {
  const grouped = new Map<string, typeof matches>()
  for (const match of matches) {
    const key = format(parseISO(match.match_date), 'yyyy-MM-dd')
    const existing = grouped.get(key) ?? []
    grouped.set(key, [...existing, match])
  }
  return grouped
}

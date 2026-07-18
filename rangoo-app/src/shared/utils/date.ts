/**
 * Date utilities for the Rangoo app.
 *
 * All dates from the FUMP API are ISO-8601 with Brasília offset (-03:00).
 * JS `new Date(iso)` respects the embedded offset, so locale methods
 * (toLocaleDateString, etc.) already output in the device's local time.
 *
 * IMPORTANT: never use `toISOString().slice(0,10)` to extract a date param —
 * `toISOString()` returns UTC, which shifts the date backward at night BRT.
 * Use `toDateParam()` instead.
 */

/** Format ISO-8601 string to "DD/MM/AAAA" (locale date). */
export function formatToLocalDate(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Format ISO-8601 string to "HH:MM" (locale time). */
export function formatToLocalTime(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/** Format ISO-8601 string to "DD/MM, HH:MM". */
export function formatToLocalDateTime(dateString: string): string {
  const d = new Date(dateString)
  const datePart = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const timePart = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${datePart}, ${timePart}`
}

/** Format a Date object to "HH:MM". */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Convert a Date to "YYYY-MM-DD" using LOCAL date parts (not UTC).
 * Safe for API query params — avoids the toISOString() UTC bug.
 */
export function toDateParam(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns "Hoje", "Ontem", or formatted date for use in lists.
 * Ideal for history items where recent dates should be human-friendly.
 */
export function getFriendlyRelativeDate(dateString: string): string {
  const d = new Date(dateString)
  const now = new Date()

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (isSameDay(d, now)) return 'Hoje'

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(d, yesterday)) return 'Ontem'

  return formatToLocalDate(dateString)
}

/**
 * Calculate remaining time as "MM:SS" string for countdown timers.
 */
export function getTimeLeft(expiration: string): string {
  const diff = new Date(expiration).getTime() - Date.now()
  if (diff <= 0) return '00:00'
  const min = Math.floor(diff / 60000)
  const sec = Math.floor((diff % 60000) / 1000)
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
}

const COUNTDOWN_URGENT_THRESHOLD_MS = 60_000

/**
 * Countdown urgency band — 'calm' for most of the wait, escalating to
 * 'urgent' only in the final minute and 'expired' once the deadline passes.
 * Keeps waiting screens from reading as an alarm from second one.
 */
export function getCountdownUrgency(expiration: string): 'calm' | 'urgent' | 'expired' {
  const diff = new Date(expiration).getTime() - Date.now()
  if (diff <= 0) return 'expired'
  if (diff <= COUNTDOWN_URGENT_THRESHOLD_MS) return 'urgent'
  return 'calm'
}

/** Time-of-day bucket for the greeting — caller resolves the translated string. */
export function getGreetingPeriod(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

const INTL_LOCALE_MAP: Record<string, string> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
}

function toIntlLocale(locale: string): string {
  return INTL_LOCALE_MAP[locale] ?? 'pt-BR'
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "Terça-feira, 17 de julho" (pt-BR) / "Tuesday, July 17" (en) — locale-correct
 * weekday + day + month, letting Intl handle per-language word order. */
export function formatFullWeekdayDate(date: Date, locale: string): string {
  const formatted = new Intl.DateTimeFormat(toIntlLocale(locale), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
  return capitalize(formatted)
}

/** "julho" (pt-BR) / "July" (en) — bare month name. */
export function getMonthName(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), { month: 'long' }).format(date)
}

/** "julho de 2026" (pt-BR) / "July 2026" (en) — calendar header. */
export function formatMonthYear(date: Date, locale: string): string {
  const formatted = new Intl.DateTimeFormat(toIntlLocale(locale), {
    month: 'long',
    year: 'numeric',
  }).format(date)
  return capitalize(formatted)
}

/** Single-letter weekday labels (D S T Q Q S S in pt-BR) starting on Sunday,
 * localized via Intl instead of a hardcoded PT array. */
export function getNarrowWeekdayLabels(locale: string): string[] {
  const intlLocale = toIntlLocale(locale)
  // Jan 4 1970 was a Sunday — used as a stable anchor to walk the week.
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(intlLocale, { weekday: 'narrow' }).format(new Date(1970, 0, 4 + i)),
  )
}

/** Check if a date is today. */
export function isToday(date: Date): boolean {
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

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

/** Return time-of-day greeting in Portuguese. */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
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

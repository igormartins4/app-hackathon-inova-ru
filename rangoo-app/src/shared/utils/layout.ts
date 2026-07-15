/**
 * Layout and UI string utilities.
 */

/** Truncate text to maxWidth characters, appending ellipsis if truncated. */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}…`
}

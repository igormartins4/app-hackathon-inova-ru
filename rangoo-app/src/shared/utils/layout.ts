/**
 * Layout and UI string utilities.
 */

/** Truncate text to maxWidth characters, appending ellipsis if truncated. */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}…`
}

const TITLE_CASE_LOWERCASE_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

/** Convert "JOÃO DA SILVA" (as returned by the API) to "João da Silva". */
export function toTitleCase(text: string): string {
  return text
    .toLocaleLowerCase('pt-BR')
    .split(' ')
    .map((word, index) =>
      index > 0 && TITLE_CASE_LOWERCASE_WORDS.has(word)
        ? word
        : word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1),
    )
    .join(' ')
}

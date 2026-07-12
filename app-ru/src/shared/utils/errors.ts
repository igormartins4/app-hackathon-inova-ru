const DEFAULT_MESSAGE = 'Ocorreu um erro. Tente novamente em instantes.'

// apiClient attaches `userMessage` (PT-BR, mapped from the HTTP status) to every
// rejected request error — this reads it back safely regardless of the error shape.
export function getErrorMessage(err: unknown, fallback: string = DEFAULT_MESSAGE): string {
  if (err && typeof err === 'object' && 'userMessage' in err) {
    const message = (err as { userMessage?: unknown }).userMessage
    if (typeof message === 'string') return message
  }
  return fallback
}

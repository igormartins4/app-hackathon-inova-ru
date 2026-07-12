type Listener = () => void

const listeners = new Set<Listener>()

// Emitted when the API rejects a request with 401 (expired/invalid token),
// so the auth layer can clear its state and the root layout can redirect to login.
export function onUnauthorized(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitUnauthorized(): void {
  for (const listener of listeners) listener()
}

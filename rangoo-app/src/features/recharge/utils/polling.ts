const BASE_INTERVALS = [3000, 5000, 8000, 13000]
const TIMEOUT_MS = 120_000
const JITTER_MS = 1000

export function jitteredDelay(base: number): number {
  return base + Math.floor(Math.random() * JITTER_MS * 2) - JITTER_MS
}

export function getNextDelay(elapsedMs: number): number {
  const pollCount = Math.floor(elapsedMs / BASE_INTERVALS[0])
  const baseIdx = Math.min(pollCount, BASE_INTERVALS.length - 1)
  return jitteredDelay(BASE_INTERVALS[baseIdx])
}

export function shouldTimeout(elapsedMs: number): boolean {
  return elapsedMs >= TIMEOUT_MS
}

export { BASE_INTERVALS, JITTER_MS, TIMEOUT_MS }

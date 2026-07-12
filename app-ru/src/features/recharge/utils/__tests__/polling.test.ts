import {
  BASE_INTERVALS,
  getNextDelay,
  JITTER_MS,
  jitteredDelay,
  shouldTimeout,
} from '@/features/recharge/utils/polling'

describe('Polling + Backoff Exponential', () => {
  describe('jitteredDelay', () => {
    it('returns a number within ±JITTER_MS of base', () => {
      for (let i = 0; i < 100; i++) {
        const delay = jitteredDelay(5000)
        expect(delay).toBeGreaterThanOrEqual(5000 - JITTER_MS)
        expect(delay).toBeLessThanOrEqual(5000 + JITTER_MS)
      }
    })

    it('jitter is within ±1s as required by FUMP', () => {
      for (let i = 0; i < 100; i++) {
        const base = BASE_INTERVALS[Math.floor(Math.random() * BASE_INTERVALS.length)]
        const delay = jitteredDelay(base)
        const diff = Math.abs(delay - base)
        expect(diff).toBeLessThanOrEqual(JITTER_MS)
      }
    })

    it('preserves base delay on average', () => {
      const samples = Array.from({ length: 1000 }, () => jitteredDelay(5000))
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length
      // Average should be close to base (within 10% tolerance)
      expect(avg).toBeGreaterThanOrEqual(4900)
      expect(avg).toBeLessThanOrEqual(5100)
    })
  })

  describe('getNextDelay', () => {
    it('returns base interval for first poll', () => {
      const delay = getNextDelay(0)
      expect(delay).toBeGreaterThanOrEqual(BASE_INTERVALS[0] - JITTER_MS)
      expect(delay).toBeLessThanOrEqual(BASE_INTERVALS[0] + JITTER_MS)
    })

    it('increases interval over time (backoff)', () => {
      // After many polls, should use higher interval
      const lateDelay = getNextDelay(60000) // 60s elapsed
      expect(lateDelay).toBeGreaterThanOrEqual(BASE_INTERVALS[3] - JITTER_MS)
    })

    it('caps at last interval', () => {
      const veryLateDelay = getNextDelay(200000) // 200s elapsed
      expect(veryLateDelay).toBeGreaterThanOrEqual(BASE_INTERVALS[3] - JITTER_MS)
      expect(veryLateDelay).toBeLessThanOrEqual(BASE_INTERVALS[3] + JITTER_MS)
    })
  })

  describe('shouldTimeout', () => {
    it('returns false before 2 minutes', () => {
      expect(shouldTimeout(0)).toBe(false)
      expect(shouldTimeout(60000)).toBe(false)
      expect(shouldTimeout(119999)).toBe(false)
    })

    it('returns true at 2 minutes', () => {
      expect(shouldTimeout(120000)).toBe(true)
      expect(shouldTimeout(120001)).toBe(true)
    })
  })

  describe('BASE_INTERVALS', () => {
    it('has 4 intervals: 3s, 5s, 8s, 13s', () => {
      expect(BASE_INTERVALS).toEqual([3000, 5000, 8000, 13000])
    })

    it('is sorted ascending', () => {
      for (let i = 1; i < BASE_INTERVALS.length; i++) {
        expect(BASE_INTERVALS[i]).toBeGreaterThan(BASE_INTERVALS[i - 1])
      }
    })
  })
})

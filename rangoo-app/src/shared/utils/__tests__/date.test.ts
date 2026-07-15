import {
  formatTime,
  formatToLocalDate,
  formatToLocalDateTime,
  formatToLocalTime,
  getFriendlyRelativeDate,
  getTimeLeft,
  toDateParam,
} from '@/shared/utils/date'

describe('Date utils', () => {
  describe('formatToLocalDate', () => {
    it('formats ISO date to DD/MM/YYYY', () => {
      const result = formatToLocalDate('2026-07-12T12:30:00-03:00')
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('formatToLocalTime', () => {
    it('formats ISO date to HH:MM', () => {
      const result = formatToLocalTime('2026-07-12T14:30:00-03:00')
      expect(result).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('formatToLocalDateTime', () => {
    it('formats ISO date to "DD/MM, HH:MM"', () => {
      const result = formatToLocalDateTime('2026-07-12T14:30:00-03:00')
      expect(result).toMatch(/\d{2}\/\d{2}, \d{2}:\d{2}/)
    })
  })

  describe('formatTime', () => {
    it('formats Date to HH:MM', () => {
      const d = new Date(2026, 6, 12, 14, 30)
      const result = formatTime(d)
      expect(result).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('toDateParam', () => {
    it('returns YYYY-MM-DD using local date parts', () => {
      const d = new Date(2026, 0, 5) // Jan 5, 2026 (local)
      expect(toDateParam(d)).toBe('2026-01-05')
    })

    it('pads single-digit months and days', () => {
      const d = new Date(2026, 0, 5)
      expect(toDateParam(d)).toBe('2026-01-05')
    })
  })

  describe('getFriendlyRelativeDate', () => {
    it('returns "Hoje" for today', () => {
      const now = new Date().toISOString()
      expect(getFriendlyRelativeDate(now)).toBe('Hoje')
    })

    it('returns "Ontem" for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(getFriendlyRelativeDate(yesterday.toISOString())).toBe('Ontem')
    })

    it('returns formatted date for older dates', () => {
      const old = '2026-01-15T12:00:00-03:00'
      const result = getFriendlyRelativeDate(old)
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('getTimeLeft', () => {
    it('returns 00:00 for expired time', () => {
      const past = new Date(Date.now() - 10000).toISOString()
      expect(getTimeLeft(past)).toBe('00:00')
    })

    it('returns MM:SS format for future time', () => {
      const future = new Date(Date.now() + 125000).toISOString() // 2m 5s
      const result = getTimeLeft(future)
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })
  })
})

import {
  formatFullWeekdayDate,
  formatMonthYear,
  formatTime,
  formatToLocalDate,
  formatToLocalDateTime,
  formatToLocalTime,
  getCountdownUrgency,
  getFriendlyRelativeDate,
  getGreetingPeriod,
  getMonthName,
  getNarrowWeekdayLabels,
  getTimeLeft,
  isToday,
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

  describe('getCountdownUrgency', () => {
    it('returns "expired" once the deadline has passed', () => {
      const past = new Date(Date.now() - 1000).toISOString()
      expect(getCountdownUrgency(past)).toBe('expired')
    })

    it('returns "urgent" in the final minute', () => {
      const soon = new Date(Date.now() + 30_000).toISOString()
      expect(getCountdownUrgency(soon)).toBe('urgent')
    })

    it('returns "calm" outside the final minute', () => {
      const later = new Date(Date.now() + 90_000).toISOString()
      expect(getCountdownUrgency(later)).toBe('calm')
    })
  })

  describe('getGreetingPeriod', () => {
    afterEach(() => {
      jest.useRealTimers()
    })

    it('returns "morning" before noon', () => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 0, 5, 9, 0))
      expect(getGreetingPeriod()).toBe('morning')
    })

    it('returns "afternoon" between noon and 6pm', () => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 0, 5, 14, 0))
      expect(getGreetingPeriod()).toBe('afternoon')
    })

    it('returns "evening" after 6pm', () => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 0, 5, 20, 0))
      expect(getGreetingPeriod()).toBe('evening')
    })
  })

  describe('formatFullWeekdayDate', () => {
    it('formats with weekday, day, and month in pt-BR', () => {
      const result = formatFullWeekdayDate(new Date(2026, 6, 14), 'pt-BR')
      expect(result).toMatch(/^[A-ZÀ-Ú]/)
      expect(result.toLowerCase()).toContain('julho')
    })

    it('formats in en for an unmapped/known locale', () => {
      const result = formatFullWeekdayDate(new Date(2026, 6, 14), 'en')
      expect(result.toLowerCase()).toContain('july')
    })

    it('falls back to pt-BR for an unknown locale code', () => {
      const result = formatFullWeekdayDate(new Date(2026, 6, 14), 'xx-unknown')
      expect(result.toLowerCase()).toContain('julho')
    })
  })

  describe('getMonthName', () => {
    it('returns the bare month name in pt-BR', () => {
      expect(getMonthName(new Date(2026, 6, 1), 'pt-BR').toLowerCase()).toBe('julho')
    })

    it('returns the bare month name in es', () => {
      expect(getMonthName(new Date(2026, 6, 1), 'es').toLowerCase()).toContain('julio')
    })
  })

  describe('formatMonthYear', () => {
    it('formats month and year, capitalized, in pt-BR', () => {
      const result = formatMonthYear(new Date(2026, 6, 1), 'pt-BR')
      expect(result).toMatch(/^[A-ZÀ-Ú]/)
      expect(result.toLowerCase()).toContain('2026')
    })

    it('formats month and year in fr', () => {
      const result = formatMonthYear(new Date(2026, 6, 1), 'fr')
      expect(result.toLowerCase()).toContain('2026')
    })
  })

  describe('getNarrowWeekdayLabels', () => {
    it('returns 7 labels starting on Sunday', () => {
      const labels = getNarrowWeekdayLabels('pt-BR')
      expect(labels).toHaveLength(7)
    })

    it('returns different labels for a different locale', () => {
      const ptLabels = getNarrowWeekdayLabels('pt-BR')
      const enLabels = getNarrowWeekdayLabels('en')
      expect(enLabels).toHaveLength(7)
      expect(enLabels).not.toEqual(ptLabels)
    })
  })

  describe('isToday', () => {
    it('returns true for the current date', () => {
      expect(isToday(new Date())).toBe(true)
    })

    it('returns false for a date in the past', () => {
      const past = new Date()
      past.setDate(past.getDate() - 3)
      expect(isToday(past)).toBe(false)
    })
  })
})

import { cleanCpf, formatCpf, isValidCpf } from '@/shared/utils/cpf'

describe('CPF utils', () => {
  describe('formatCpf', () => {
    it('formats 11 digits correctly', () => {
      expect(formatCpf('12345678909')).toBe('123.456.789-09')
    })

    it('formats partial CPFs', () => {
      expect(formatCpf('123')).toBe('123')
      expect(formatCpf('1234')).toBe('123.4')
      expect(formatCpf('123456')).toBe('123.456')
      expect(formatCpf('1234567')).toBe('123.456.7')
      expect(formatCpf('123456789')).toBe('123.456.789')
    })

    it('strips non-digit characters before formatting', () => {
      expect(formatCpf('123.456.789-09')).toBe('123.456.789-09')
      expect(formatCpf('abc12345678909')).toBe('123.456.789-09')
    })

    it('truncates to 11 digits max', () => {
      expect(formatCpf('123456789091234')).toBe('123.456.789-09')
    })

    it('handles empty string', () => {
      expect(formatCpf('')).toBe('')
    })
  })

  describe('cleanCpf', () => {
    it('removes all non-digit characters', () => {
      expect(cleanCpf('123.456.789-09')).toBe('12345678909')
    })

    it('returns digits only', () => {
      expect(cleanCpf('12345678909')).toBe('12345678909')
    })

    it('handles empty string', () => {
      expect(cleanCpf('')).toBe('')
    })
  })

  describe('isValidCpf', () => {
    it('returns true for valid CPF with correct check digits', () => {
      expect(isValidCpf('123.456.789-09')).toBe(true)
      expect(isValidCpf('12345678909')).toBe(true)
    })

    it('returns false for invalid check digits', () => {
      expect(isValidCpf('123.456.789-01')).toBe(false)
      expect(isValidCpf('12345678901')).toBe(false)
    })

    it('returns false for all-same-digit CPFs', () => {
      expect(isValidCpf('111.111.111-11')).toBe(false)
      expect(isValidCpf('000.000.000-00')).toBe(false)
      expect(isValidCpf('999.999.999-99')).toBe(false)
    })

    it('returns false for less than 11 digits', () => {
      expect(isValidCpf('123.456.789-0')).toBe(false)
      expect(isValidCpf('1234567890')).toBe(false)
      expect(isValidCpf('123')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isValidCpf('')).toBe(false)
    })
  })
})

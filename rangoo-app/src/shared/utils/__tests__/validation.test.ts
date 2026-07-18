import { isValidCpf, RECHARGE_LIMITS } from '@/shared/utils/validation'

describe('Validation utils', () => {
  describe('isValidCpf', () => {
    it('returns true for valid CPF', () => {
      expect(isValidCpf('123.456.789-09')).toBe(true)
      expect(isValidCpf('12345678909')).toBe(true)
    })

    it('returns false for invalid check digits', () => {
      expect(isValidCpf('123.456.789-01')).toBe(false)
    })

    it('returns false when only the second check digit is wrong', () => {
      // First check digit (0) is correct; second (should be 9) is wrong.
      expect(isValidCpf('123.456.789-00')).toBe(false)
    })

    it('returns false when the first check digit is wrong', () => {
      expect(isValidCpf('123.456.789-19')).toBe(false)
    })

    it('handles the mod-11 remainder-10-maps-to-0 rule on the second check digit', () => {
      expect(isValidCpf('100.000.222-50')).toBe(true)
    })

    it('returns false for all-same-digit CPFs', () => {
      expect(isValidCpf('111.111.111-11')).toBe(false)
      expect(isValidCpf('000.000.000-00')).toBe(false)
    })

    it('returns false for short strings', () => {
      expect(isValidCpf('123')).toBe(false)
      expect(isValidCpf('')).toBe(false)
    })
  })

  describe('RECHARGE_LIMITS', () => {
    it('MIN is 5', () => {
      expect(RECHARGE_LIMITS.MIN).toBe(5)
    })

    it('MAX is 500', () => {
      expect(RECHARGE_LIMITS.MAX).toBe(500)
    })
  })
})

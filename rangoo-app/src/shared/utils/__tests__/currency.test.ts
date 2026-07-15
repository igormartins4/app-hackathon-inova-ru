import { formatCurrency, parseCurrencyStringToNumber } from '@/shared/utils/currency'

describe('Currency utils', () => {
  describe('formatCurrency', () => {
    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('R$\u00a00,00')
    })

    it('formats integer values', () => {
      expect(formatCurrency(5)).toBe('R$\u00a05,00')
      expect(formatCurrency(500)).toBe('R$\u00a0500,00')
    })

    it('formats decimal values', () => {
      expect(formatCurrency(15.5)).toBe('R$\u00a015,50')
      expect(formatCurrency(45.9)).toBe('R$\u00a045,90')
    })

    it('formats large values with thousands separator', () => {
      expect(formatCurrency(1500)).toContain('1.500')
    })
  })

  describe('parseCurrencyStringToNumber', () => {
    it('parses formatted BRL string', () => {
      expect(parseCurrencyStringToNumber('R$ 15,50')).toBe(15.5)
    })

    it('parses string without R$ prefix', () => {
      expect(parseCurrencyStringToNumber('15,50')).toBe(15.5)
    })

    it('parses string with dots as thousands separator', () => {
      expect(parseCurrencyStringToNumber('R$ 1.550,50')).toBe(1550.5)
    })

    it('returns 0 for empty string', () => {
      expect(parseCurrencyStringToNumber('')).toBe(0)
    })

    it('returns 0 for non-numeric string', () => {
      expect(parseCurrencyStringToNumber('abc')).toBe(0)
    })
  })
})

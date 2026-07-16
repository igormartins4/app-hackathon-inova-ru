import {
  maskCpf,
  maskMoneyInput,
  parseMoneyInput,
  sanitizeCurrencyInput,
  sanitizeDigits,
  sanitizePassword,
  unmask,
} from '@/shared/utils/mask'

describe('Mask utils', () => {
  describe('maskCpf', () => {
    it('applies CPF mask progressively', () => {
      expect(maskCpf('1')).toBe('1')
      expect(maskCpf('123')).toBe('123')
      expect(maskCpf('1234')).toBe('123.4')
      expect(maskCpf('123456')).toBe('123.456')
      expect(maskCpf('1234567')).toBe('123.456.7')
      expect(maskCpf('123456789')).toBe('123.456.789')
      expect(maskCpf('12345678901')).toBe('123.456.789-01')
    })

    it('strips non-digits before masking', () => {
      expect(maskCpf('abc12345678901')).toBe('123.456.789-01')
    })

    it('truncates to 11 digits', () => {
      expect(maskCpf('123456789012345')).toBe('123.456.789-01')
    })

    it('handles empty string', () => {
      expect(maskCpf('')).toBe('')
    })
  })

  describe('unmask', () => {
    it('removes all non-digit characters', () => {
      expect(unmask('123.456.789-01')).toBe('12345678901')
      expect(unmask('abc123')).toBe('123')
      expect(unmask('!@#$%')).toBe('')
    })

    it('handles empty string', () => {
      expect(unmask('')).toBe('')
    })
  })

  describe('sanitizeCurrencyInput', () => {
    it('allows digits', () => {
      expect(sanitizeCurrencyInput('123')).toBe('123')
    })

    it('allows one decimal separator', () => {
      expect(sanitizeCurrencyInput('12,5')).toBe('12,5')
      expect(sanitizeCurrencyInput('12.5')).toBe('12.5')
    })

    it('removes duplicate separators', () => {
      expect(sanitizeCurrencyInput('12,5,3')).toBe('12,53')
    })

    it('removes non-numeric characters', () => {
      expect(sanitizeCurrencyInput('abc123')).toBe('123')
      expect(sanitizeCurrencyInput('R$ 50')).toBe('50')
    })
  })

  describe('maskMoneyInput', () => {
    it('formats typed digits as cents', () => {
      expect(maskMoneyInput('1')).toBe('R$ 0,01')
      expect(maskMoneyInput('12')).toBe('R$ 0,12')
      expect(maskMoneyInput('1234')).toBe('R$ 12,34')
    })

    it('strips non-digits and limits length', () => {
      expect(maskMoneyInput('R$ abc123456', 4)).toBe('R$ 12,34')
    })
  })

  describe('parseMoneyInput', () => {
    it('parses Brazilian currency strings', () => {
      expect(parseMoneyInput('R$ 12,34')).toBe(12.34)
    })
  })

  describe('sanitizeDigits', () => {
    it('keeps only digits with limit', () => {
      expect(sanitizeDigits('ab12cd34', 3)).toBe('123')
    })
  })

  describe('sanitizePassword', () => {
    it('removes line breaks and limits length', () => {
      expect(sanitizePassword('ab\ncd', 3)).toBe('abc')
    })
  })
})

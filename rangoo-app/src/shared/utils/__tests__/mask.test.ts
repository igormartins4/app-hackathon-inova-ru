import { maskCpf, sanitizeCurrencyInput, unmask } from '@/shared/utils/mask'

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
})

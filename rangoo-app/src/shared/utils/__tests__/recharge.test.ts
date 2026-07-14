import { MAX_VALUE, MIN_VALUE, parseAmount, validateRechargeAmount } from '@/shared/utils/recharge'

describe('Recharge validation', () => {
  describe('validateRechargeAmount', () => {
    it('accepts valid amount within limits', () => {
      expect(validateRechargeAmount(50, 0)).toEqual({ valid: true })
      expect(validateRechargeAmount(100, 200)).toEqual({ valid: true })
      expect(validateRechargeAmount(5, 0)).toEqual({ valid: true })
      expect(validateRechargeAmount(500, 0)).toEqual({ valid: true })
    })

    it('rejects amount below minimum', () => {
      const result = validateRechargeAmount(4, 0)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('mínimo')
    })

    it('rejects amount above maximum', () => {
      const result = validateRechargeAmount(501, 0)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('máximo')
    })

    it('rejects amount that exceeds composite limit (balance + amount > 500)', () => {
      const result = validateRechargeAmount(100, 450)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('fora do limite')
      expect(result.error).toContain('500,00')
    })

    it('accepts amount that exactly meets composite limit', () => {
      expect(validateRechargeAmount(50, 450)).toEqual({ valid: true })
      expect(validateRechargeAmount(500, 0)).toEqual({ valid: true })
    })

    it('shows remaining limit in error message', () => {
      const result = validateRechargeAmount(100, 401)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('99,00')
    })
  })

  describe('parseAmount', () => {
    it('parses dot decimal', () => {
      expect(parseAmount('25.50')).toBe(25.5)
    })

    it('parses comma decimal', () => {
      expect(parseAmount('25,50')).toBe(25.5)
    })

    it('parses integer', () => {
      expect(parseAmount('100')).toBe(100)
    })
  })

  describe('constants', () => {
    it('MIN_VALUE is 5', () => {
      expect(MIN_VALUE).toBe(5)
    })

    it('MAX_VALUE is 500', () => {
      expect(MAX_VALUE).toBe(500)
    })
  })
})

import { firstFieldError, loginSchema, rechargeSchema, transferSchema } from '@/shared/utils/forms'

describe('form schemas', () => {
  it('validates login CPF and password', () => {
    expect(loginSchema.safeParse({ cpf: '52998224725', password: '123456' }).success).toBe(true)
    expect(loginSchema.safeParse({ cpf: '11111111111', password: '' }).success).toBe(false)
  })

  it('validates recharge limits', () => {
    expect(rechargeSchema(10, 500).safeParse({ amount: 20 }).success).toBe(true)
    expect(rechargeSchema(490, 500).safeParse({ amount: 20 }).success).toBe(false)
  })

  it('validates transfer destination and amount', () => {
    expect(transferSchema(50).safeParse({ destination: '12345', amount: 10 }).success).toBe(true)
    expect(transferSchema(50).safeParse({ destination: 'ab', amount: 60 }).success).toBe(false)
  })

  it('accepts the minimum and current balance but rejects amounts outside them', () => {
    const schema = transferSchema(45.5)
    expect(schema.safeParse({ destination: '12345', amount: 5 }).success).toBe(true)
    expect(schema.safeParse({ destination: '12345', amount: 45.5 }).success).toBe(true)
    expect(schema.safeParse({ destination: '12345', amount: 4.99 }).success).toBe(false)
    expect(schema.safeParse({ destination: '12345', amount: 45.51 }).success).toBe(false)
  })
})

describe('firstFieldError', () => {
  it('returns the first error message for a field', () => {
    expect(firstFieldError({ amount: ['too low', 'too high'] }, 'amount')).toBe('too low')
  })

  it('returns undefined when the field has no errors', () => {
    expect(firstFieldError({}, 'amount')).toBeUndefined()
  })
})

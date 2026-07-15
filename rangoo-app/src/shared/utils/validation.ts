/**
 * Centralized validation logic.
 * CPF validation (modulo 11) and recharge limits.
 */

const CPF_ALL_SAME_DIGIT = /^(\d)\1{10}$/

/** Validate CPF check digits using the official modulo-11 algorithm. */
export function isValidCpf(formatted: string): boolean {
  const cpf = formatted.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  if (CPF_ALL_SAME_DIGIT.test(cpf)) return false

  // First check digit (position 10)
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== Number(cpf[9])) return false

  // Second check digit (position 11)
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  return remainder === Number(cpf[10])
}

/** Recharge limits per API spec (section 7.3). */
export const RECHARGE_LIMITS = {
  MIN: 5,
  MAX: 500,
} as const

/**
 * Input masking and sanitization utilities.
 * CPF-specific masks delegate to cpf.ts for single-source validation.
 */
import { cleanCpf, formatCpf } from './cpf'
import { formatCurrency, parseCurrencyStringToNumber } from './currency'

export const CPF_MAX_LENGTH = 14
export const CPF_DIGITS_LENGTH = 11
export const PASSWORD_MAX_LENGTH = 64
export const TRANSFER_DESTINATION_MAX_LENGTH = 14
export const MONEY_MAX_LENGTH = 12

/** Apply CPF visual mask (000.000.000-00) progressively as user types. */
export const maskCpf = formatCpf

/** Remove all non-numeric characters from a string. */
export function unmask(value: string): string {
  return value.replace(/\D/g, '')
}

export function sanitizeDigits(value: string, maxLength = Number.POSITIVE_INFINITY): string {
  return unmask(value).slice(0, maxLength)
}

export function sanitizePassword(value: string, maxLength = PASSWORD_MAX_LENGTH): string {
  return value.replace(/[\r\n\t]/g, '').slice(0, maxLength)
}

/** Clean a formatted CPF to raw digits (alias for cpf.cleanCpf). */
export const cleanCpfDigits = cleanCpf

/**
 * Sanitize currency input: allow only digits, one decimal separator (`,``.`),
 * and remove duplicate separators.
 */
export function sanitizeCurrencyInput(text: string): string {
  return text.replace(/[^0-9.,]/g, '').replace(/([.,]\d+)[.,]/g, '$1')
}

/** Money mask that treats typed digits as cents: 1 -> R$ 0,01; 1234 -> R$ 12,34. */
export function maskMoneyInput(text: string, maxDigits = MONEY_MAX_LENGTH): string {
  const digits = sanitizeDigits(text, maxDigits)
  if (!digits) return ''
  return formatCurrency(Number(digits) / 100)
}

export function parseMoneyInput(text: string): number {
  return parseCurrencyStringToNumber(text)
}

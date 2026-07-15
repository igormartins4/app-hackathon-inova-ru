/**
 * Input masking and sanitization utilities.
 * CPF-specific masks delegate to cpf.ts for single-source validation.
 */
import { cleanCpf, formatCpf } from './cpf'

/** Apply CPF visual mask (000.000.000-00) progressively as user types. */
export const maskCpf = formatCpf

/** Remove all non-numeric characters from a string. */
export function unmask(value: string): string {
  return value.replace(/\D/g, '')
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

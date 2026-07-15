import { formatCurrency } from './currency'
import { RECHARGE_LIMITS } from './validation'

const { MIN: MIN_VALUE, MAX: DEFAULT_MAX_VALUE } = RECHARGE_LIMITS

export function validateRechargeAmount(
  amount: number,
  currentBalance: number,
  limiteRecarga: number = DEFAULT_MAX_VALUE,
): { valid: boolean; error?: string } {
  if (amount < MIN_VALUE) {
    return { valid: false, error: `Valor mínimo é ${formatCurrency(MIN_VALUE)}` }
  }
  if (amount > limiteRecarga) {
    return {
      valid: false,
      error: `Valor máximo é ${formatCurrency(limiteRecarga)}`,
    }
  }
  if (currentBalance + amount > limiteRecarga) {
    const remaining = limiteRecarga - currentBalance
    return {
      valid: false,
      error: `Valor fora do limite. Máximo ${formatCurrency(limiteRecarga)} (limite restante: ${formatCurrency(remaining)}).`,
    }
  }
  return { valid: true }
}

export function parseAmount(text: string): number {
  return Number(text.replace(',', '.'))
}

export { DEFAULT_MAX_VALUE as MAX_VALUE, MIN_VALUE }

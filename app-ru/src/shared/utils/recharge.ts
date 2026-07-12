const MIN_VALUE = 5
const MAX_VALUE = 500

export function validateRechargeAmount(
  amount: number,
  currentBalance: number,
): { valid: boolean; error?: string } {
  if (amount < MIN_VALUE) {
    return { valid: false, error: `Valor mínimo é R$ ${MIN_VALUE.toFixed(2).replace('.', ',')}` }
  }
  if (amount > MAX_VALUE) {
    return { valid: false, error: `Valor máximo é R$ ${MAX_VALUE.toFixed(2).replace('.', ',')}` }
  }
  if (currentBalance + amount > MAX_VALUE) {
    const remaining = MAX_VALUE - currentBalance
    return {
      valid: false,
      error: `Valor fora do limite. Máximo R$ 500,00 (limite restante: R$ ${remaining.toFixed(2).replace('.', ',')}).`,
    }
  }
  return { valid: true }
}

export function parseAmount(text: string): number {
  return Number(text.replace(',', '.'))
}

export { MAX_VALUE, MIN_VALUE }

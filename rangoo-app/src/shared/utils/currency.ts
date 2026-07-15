const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(value: number): string {
  return brlFormatter.format(value)
}

export function parseCurrencyStringToNumber(value: string): number {
  // Strip "R$" prefix and whitespace, then convert Brazilian format to JS number
  const cleaned = value.replace(/R\$\s?/g, '').trim()
  // "1.550,50" → "1550.50"
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  const result = Number.parseFloat(normalized)
  return Number.isFinite(result) ? result : 0
}

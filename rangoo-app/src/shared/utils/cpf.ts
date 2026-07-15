export function formatCpf(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function cleanCpf(formatted: string): string {
  return formatted.replace(/\D/g, '')
}

export function isValidCpf(formatted: string): boolean {
  const cpf = cleanCpf(formatted)
  if (cpf.length !== 11) return false

  // Reject known invalid patterns (all same digit)
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Validate check digits (mod 11 algorithm)
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== Number(cpf[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  return remainder === Number(cpf[10])
}

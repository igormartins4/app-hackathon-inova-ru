import { z } from 'zod'
import { isValidCpf } from './validation'

export const loginSchema = z.object({
  cpf: z.string().length(11, 'CPF deve ter 11 números.').refine(isValidCpf, 'CPF inválido.'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória.')
    .max(64, 'Senha deve ter no máximo 64 caracteres.'),
})

export function rechargeSchema(currentBalance: number, limit: number) {
  return z.object({
    amount: z
      .number()
      .min(5, 'Valor mínimo é R$ 5,00.')
      .max(
        limit,
        `Valor máximo é ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(limit)}.`,
      )
      .refine((amount) => currentBalance + amount <= limit, {
        message: 'Valor fora do limite restante de recarga.',
      }),
  })
}

export function transferSchema(maxAmount: number) {
  return z.object({
    destination: z
      .string()
      .min(3, 'Informe pelo menos 3 números do destinatário.')
      .max(14, 'Destinatário deve ter no máximo 14 números.')
      .regex(/^\d+$/, 'Destinatário deve conter apenas números.'),
    amount: z
      .number()
      .min(5, 'Valor mínimo é R$ 5,00.')
      .max(maxAmount, 'Valor maior que o saldo disponível.'),
  })
}

export function firstFieldError(errors: Record<string, string[] | undefined>, field: string) {
  return errors[field]?.[0]
}

import type { RestauranteCode } from '@/config/restaurantes'
import { toDateParam } from '@/shared/utils'
import type { AvisoFuncionamento } from '../types/restaurante.types'

/** Retorna o primeiro aviso ativo (hoje entre `inicio` e `fim`) para o RU informado, ou `null`. */
export function getAvisoAtivo(
  avisos: AvisoFuncionamento[],
  codigo: RestauranteCode,
  now: Date = new Date(),
): AvisoFuncionamento | null {
  const hoje = toDateParam(now)
  return avisos.find((a) => a.ruCodes.includes(codigo) && hoje >= a.inicio && hoje <= a.fim) ?? null
}

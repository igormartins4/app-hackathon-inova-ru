import type { HorarioSemana, Refeicao, RUStatusResult } from '../types/restaurante.types'

const MEAL_ORDER: Refeicao[] = ['cafe', 'almoco', 'jantar']
const DIAS_BUSCA_PROXIMA_ABERTURA = 6

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function statusParaUmHorario(horarios: HorarioSemana, now: Date): RUStatusResult {
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const hoje = horarios[now.getDay()] ?? null

  if (hoje) {
    for (const refeicao of MEAL_ORDER) {
      const faixa = hoje[refeicao]
      if (!faixa) continue
      const abre = toMinutes(faixa.abre)
      const fecha = toMinutes(faixa.fecha)
      if (nowMinutes >= abre && nowMinutes < fecha) {
        return {
          aberto: true,
          refeicaoAtual: refeicao,
          minutosParaFechar: fecha - nowMinutes,
          proximaAbertura: null,
        }
      }
    }
  }

  for (let offset = 0; offset <= DIAS_BUSCA_PROXIMA_ABERTURA; offset++) {
    const diaIdx = (now.getDay() + offset) % 7
    const dia = horarios[diaIdx]
    if (!dia) continue

    for (const refeicao of MEAL_ORDER) {
      const faixa = dia[refeicao]
      if (!faixa) continue
      const abreMin = toMinutes(faixa.abre)
      if (offset === 0 && abreMin <= nowMinutes) continue // já passou hoje

      const data = new Date(now)
      data.setDate(data.getDate() + offset)
      data.setHours(Math.floor(abreMin / 60), abreMin % 60, 0, 0)
      return {
        aberto: false,
        refeicaoAtual: null,
        minutosParaFechar: null,
        proximaAbertura: { data, refeicao },
      }
    }
  }

  return { aberto: false, refeicaoAtual: null, minutosParaFechar: null, proximaAbertura: null }
}

/**
 * Aceita uma ou mais grades de horário (RUs com múltiplos prédios físicos sob o
 * mesmo código oficial, ex. Saúde/Direito, têm um horário por prédio). Considera
 * aberto se QUALQUER uma estiver aberta agora; ao fechar, usa a que fecha mais
 * tarde; ao decidir a próxima abertura, usa a mais próxima entre todas.
 */
export function getRUStatus(
  horarios: HorarioSemana | HorarioSemana[],
  now: Date = new Date(),
): RUStatusResult {
  const grades = Array.isArray(horarios) ? horarios : [horarios]
  const resultados = grades.map((g) => statusParaUmHorario(g, now))

  const abertos = resultados.filter((r) => r.aberto)
  if (abertos.length > 0) {
    return abertos.reduce((mais, atual) =>
      (atual.minutosParaFechar ?? 0) > (mais.minutosParaFechar ?? 0) ? atual : mais,
    )
  }

  const proximasAberturas = resultados
    .map((r) => r.proximaAbertura)
    .filter((p): p is NonNullable<typeof p> => p !== null)

  if (proximasAberturas.length === 0) {
    return { aberto: false, refeicaoAtual: null, minutosParaFechar: null, proximaAbertura: null }
  }

  const maisProxima = proximasAberturas.reduce((cedo, atual) =>
    atual.data.getTime() < cedo.data.getTime() ? atual : cedo,
  )
  return {
    aberto: false,
    refeicaoAtual: null,
    minutosParaFechar: null,
    proximaAbertura: maisProxima,
  }
}

import type { HorarioSemana } from '../../types/restaurante.types'
import { getRUStatus } from '../ruStatus'

const schedule: HorarioSemana = {
  1: { almoco: { abre: '11:00', fecha: '14:00' } },
  2: { jantar: { abre: '17:00', fecha: '20:00' } },
}

describe('getRUStatus', () => {
  it('returns the earliest later-day opening with its real date after hours', () => {
    const now = new Date(2026, 6, 20, 15, 0) // Monday

    expect(getRUStatus(schedule, now)).toMatchObject({
      aberto: false,
      proximaAbertura: { refeicao: 'jantar', data: new Date(2026, 6, 21, 17, 0) },
    })
  })

  it('does not report a stale opening when the schedule has no future service', () => {
    const mondayOnly: HorarioSemana = { 1: { almoco: { abre: '11:00', fecha: '14:00' } } }

    expect(getRUStatus(mondayOnly, new Date(2026, 6, 20, 15, 0)).proximaAbertura).toBeNull()
  })
})

import type { AvisoFuncionamento } from '../../types/restaurante.types'
import { getAvisoAtivo } from '../avisoAtivo'

const aviso: AvisoFuncionamento = {
  ruCodes: ['0002'],
  titulo: 'Manutenção',
  descricao: 'Atendimento alterado.',
  inicio: '2026-07-18',
  fim: '2026-07-20',
  fonteUrl: 'https://fump.ufmg.br/',
  atualizadoEm: '2026-07-18',
}

describe('getAvisoAtivo', () => {
  it('returns an aviso only for its RU during inclusive dates', () => {
    expect(getAvisoAtivo([aviso], '0002', new Date('2026-07-18T12:00:00'))).toBe(aviso)
    expect(getAvisoAtivo([aviso], '0002', new Date('2026-07-20T12:00:00'))).toBe(aviso)
    expect(getAvisoAtivo([aviso], '0003', new Date('2026-07-19T12:00:00'))).toBeNull()
    expect(getAvisoAtivo([aviso], '0002', new Date('2026-07-21T12:00:00'))).toBeNull()
  })
})

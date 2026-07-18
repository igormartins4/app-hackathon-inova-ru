import type { TranslationKeys } from '@/shared/i18n'
import type { AvisoFuncionamento } from '../types/restaurante.types'

export function getAvisoTexto(aviso: AvisoFuncionamento, t: TranslationKeys) {
  const codigo = aviso.ruCodes[0]

  switch (codigo) {
    case '0001':
      return { titulo: t.restaurantVacationTitle, descricao: t.restaurantVacationSaudeDireito }
    case '0002':
      return { titulo: t.restaurantVacationTitle, descricao: t.restaurantVacationSetorial2 }
    case '0004':
      return { titulo: t.restaurantVacationTitle, descricao: t.restaurantVacationIca }
    default:
      return { titulo: aviso.titulo, descricao: aviso.descricao }
  }
}

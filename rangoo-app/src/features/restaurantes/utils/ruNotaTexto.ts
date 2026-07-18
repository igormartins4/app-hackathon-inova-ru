import type { RestauranteCode } from '@/config/restaurantes'
import type { TranslationKeys } from '@/shared/i18n'

export function getRUNotaTexto(codigo: RestauranteCode, t: TranslationKeys): string {
  switch (codigo) {
    case '0001':
      return t.restaurantNoteSaudeDireito
    case '0002':
      return t.restaurantNoteSetorial2
    case '0003':
      return t.restaurantNoteSetorial1
    case '0004':
      return t.restaurantNoteIca
    case '0005':
      return t.restaurantNoteHrtn
  }
}

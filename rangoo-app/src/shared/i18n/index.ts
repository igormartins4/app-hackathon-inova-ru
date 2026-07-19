import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'
import { create } from 'zustand'
import en from './en'
import es from './es'
import fr from './fr'
import ptBR from './pt-BR'

export type Locale = 'pt-BR' | 'en' | 'es' | 'fr'

const LANGUAGE_CODE_TO_LOCALE: Record<string, Locale> = {
  pt: 'pt-BR',
  en: 'en',
  es: 'es',
  fr: 'fr',
}

/** Mapeia o idioma do SO (`Localization.getLocales()`) pra um dos 4 idiomas
 * suportados, com fallback pt-BR — usado só como valor INICIAL quando não há
 * preferência manual salva; o override manual continua tendo prioridade e
 * persiste normalmente (mesmo padrão do tamanho de fonte). */
export function getSystemLocale(): Locale {
  try {
    const languageCode = Localization.getLocales()[0]?.languageCode
    return (languageCode && LANGUAGE_CODE_TO_LOCALE[languageCode]) || 'pt-BR'
  } catch {
    return 'pt-BR'
  }
}

export type TranslationKeys = { [K in keyof typeof ptBR]: string }

export const LOCALES: Record<Locale, { label: string; flag: string }> = {
  'pt-BR': { label: 'Português', flag: '🇧🇷' },
  en: { label: 'English', flag: '🇬🇧' },
  es: { label: 'Español', flag: '🇪🇸' },
  fr: { label: 'Français', flag: '🇫🇷' },
}

const TRANSLATIONS: Record<Locale, TranslationKeys> = {
  'pt-BR': ptBR as TranslationKeys,
  en: en as TranslationKeys,
  es: es as TranslationKeys,
  fr: fr as TranslationKeys,
}

const STORAGE_KEY = '@rangoo_locale'

interface I18nState {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationKeys
  initialize: () => Promise<void>
}

export const useI18n = create<I18nState>((set, _get) => ({
  locale: 'pt-BR',
  t: TRANSLATIONS['pt-BR'],
  setLocale: (locale: Locale) => {
    set({ locale, t: TRANSLATIONS[locale] })
    AsyncStorage.setItem(STORAGE_KEY, locale)
  },
  initialize: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY)
      const locale = saved && saved in TRANSLATIONS ? (saved as Locale) : getSystemLocale()
      set({ locale, t: TRANSLATIONS[locale] })
    } catch {}
  },
}))

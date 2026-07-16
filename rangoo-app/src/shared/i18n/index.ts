import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import en from './en'
import es from './es'
import fr from './fr'
import ptBR from './pt-BR'

export type Locale = 'pt-BR' | 'en' | 'es' | 'fr'

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
      if (saved && saved in TRANSLATIONS) {
        const locale = saved as Locale
        set({ locale, t: TRANSLATIONS[locale] })
      }
    } catch {}
  },
}))

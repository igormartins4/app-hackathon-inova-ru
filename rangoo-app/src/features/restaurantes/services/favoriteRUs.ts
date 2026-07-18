import AsyncStorage from '@react-native-async-storage/async-storage'
import { RESTAURANTES_OFICIAIS, type RestauranteCode } from '@/config/restaurantes'

const FAVORITES_KEY = '@rangoo_favorite_rus'
const OFFICIAL_CODES = new Set<RestauranteCode>(RESTAURANTES_OFICIAIS.map(({ codigo }) => codigo))

export function normalizeFavoriteRUs(serialized: string | null): RestauranteCode[] {
  if (!serialized) return []

  try {
    const parsed: unknown = JSON.parse(serialized)
    if (!Array.isArray(parsed)) return []
    return [
      ...new Set(
        parsed.filter(
          (code): code is RestauranteCode =>
            typeof code === 'string' && OFFICIAL_CODES.has(code as RestauranteCode),
        ),
      ),
    ]
  } catch {
    return []
  }
}

export function toggleFavoriteCode(
  favorites: RestauranteCode[],
  codigo: RestauranteCode,
): RestauranteCode[] {
  return favorites.includes(codigo)
    ? favorites.filter((favorite) => favorite !== codigo)
    : [...favorites, codigo]
}

export async function getFavoriteRUs(): Promise<RestauranteCode[]> {
  try {
    return normalizeFavoriteRUs(await AsyncStorage.getItem(FAVORITES_KEY))
  } catch {
    return []
  }
}

export async function toggleFavoriteRU(codigo: RestauranteCode): Promise<RestauranteCode[]> {
  const favorites = await getFavoriteRUs()
  const next = toggleFavoriteCode(favorites, codigo)
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  return next
}

export async function getPrimaryFavoriteRU(): Promise<RestauranteCode | null> {
  return (await getFavoriteRUs())[0] ?? null
}

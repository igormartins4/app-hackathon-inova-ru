import { create } from 'zustand'
import type { RestauranteCode } from '@/config/restaurantes'
import { getFavoriteRUs, toggleFavoriteRU } from '@/features/restaurantes/services/favoriteRUs'

interface FavoriteRUsState {
  favorites: RestauranteCode[]
  initialized: boolean
  initialize: () => Promise<void>
  toggle: (codigo: RestauranteCode) => Promise<void>
}

export const useFavoriteRUsStore = create<FavoriteRUsState>((set) => ({
  favorites: [],
  initialized: false,
  initialize: async () => {
    set({ favorites: await getFavoriteRUs(), initialized: true })
  },
  toggle: async (codigo) => {
    set({ favorites: await toggleFavoriteRU(codigo) })
  },
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}))

import { normalizeFavoriteRUs, toggleFavoriteCode } from '../../services/favoriteRUs'

describe('favorite RUs', () => {
  it('keeps only unique official restaurant codes', () => {
    expect(normalizeFavoriteRUs('["0003", "0003", "0005", "invalid", 3]')).toEqual(['0003', '0005'])
  })

  it('rejects invalid serialized data', () => {
    expect(normalizeFavoriteRUs('{bad json')).toEqual([])
    expect(normalizeFavoriteRUs('{"codigo":"0001"}')).toEqual([])
  })

  it('adds and removes an official favorite', () => {
    expect(toggleFavoriteCode(['0002'], '0003')).toEqual(['0002', '0003'])
    expect(toggleFavoriteCode(['0002', '0003'], '0002')).toEqual(['0003'])
  })
})

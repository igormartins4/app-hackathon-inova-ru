import { MMKV } from 'react-native-mmkv'

const mmkv = new MMKV()

export function setCache<T>(key: string, value: T): void {
  mmkv.set(key, JSON.stringify(value))
}

export function getCache<T>(key: string): T | null {
  const raw = mmkv.getString(key)
  return raw ? (JSON.parse(raw) as T) : null
}

export function deleteCache(key: string): void {
  mmkv.delete(key)
}

export function getAllCacheKeys(): string[] {
  return mmkv.getAllKeys()
}

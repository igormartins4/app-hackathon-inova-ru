import AsyncStorage from '@react-native-async-storage/async-storage'

// AsyncStorage (not MMKV): react-native-mmkv is a native module that isn't bundled
// in the generic Expo Go client and requires a custom development build.
// AsyncStorage ships with Expo Go, so plain `pnpm start` + scan works.

export async function setCache<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value))
}

export async function getCache<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : null
}

export async function deleteCache(key: string): Promise<void> {
  await AsyncStorage.removeItem(key)
}

export async function getAllCacheKeys(): Promise<readonly string[]> {
  return AsyncStorage.getAllKeys()
}

// Raw string storage adapter (no extra JSON layer) for TanStack Query's
// async storage persister — it already serializes the whole cache itself.
export const asyncCacheStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
}

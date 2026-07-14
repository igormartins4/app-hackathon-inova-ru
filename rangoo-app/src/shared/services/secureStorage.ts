import * as SecureStore from 'expo-secure-store'

const KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const

// --- Token ---

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token)
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.AUTH_TOKEN)
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN)
}

// --- User (generic, stored as JSON string) ---

export async function setUser<T>(user: T): Promise<void> {
  await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(user))
}

export async function getUser<T>(): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(KEYS.USER_DATA)
  return raw ? (JSON.parse(raw) as T) : null
}

export async function removeUser(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.USER_DATA)
}

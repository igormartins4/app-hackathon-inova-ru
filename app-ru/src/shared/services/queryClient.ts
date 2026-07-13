import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { asyncCacheStorage } from './cacheStorage'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: ONE_DAY_MS, // keep cached data around long enough to be persisted/restored
      retry: 3,
      networkMode: 'offlineFirst',
    },
  },
})

// Persists balance/history query results to AsyncStorage so they survive app
// restarts with no connectivity (BALC-04, HIST-04, OFFL-02).
export const queryPersister = createAsyncStoragePersister({
  storage: asyncCacheStorage,
  key: 'inova-ru-query-cache',
})

export const QUERY_PERSIST_MAX_AGE = ONE_DAY_MS

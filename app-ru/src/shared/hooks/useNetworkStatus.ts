import NetInfo, { type NetInfoState } from '@react-native-community/netinfo'
import { useEffect, useState } from 'react'

interface NetworkStatus {
  isConnected: boolean
  isOffline: boolean
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isOffline: false,
  })

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false
      setStatus({ isConnected: connected, isOffline: !connected })
    })

    return () => unsubscribe()
  }, [])

  return status
}

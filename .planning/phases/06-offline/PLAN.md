# Phase 6: Offline & Connectivity

**Goal**: The app degrades gracefully when offline and syncs seamlessly when connectivity returns
**Depends on**: Phases 3, 4, 5
**Requirements**: OFFL-01, OFFL-02, OFFL-03, OFFL-04

## Plans

### 06-01: Network state management
- Use @react-native-community/netinfo (already installed)
- Create src/shared/hooks/useNetworkStatus.ts
- Expose isConnected state

### 06-02: Connection status indicator
- Create src/shared/components/ui/OfflineBanner.tsx
- Show banner when offline
- "Sem conexão. Verifique sua internet e tente novamente."

### 06-03: Offline payment flow guard
- Disable recharge button when offline
- Show message: "Conecte-se à internet para recarregar"

### 06-04: Stale data indicators
- Show "Dados aproximados" when displaying cached balance
- Already partially implemented in Phase 3

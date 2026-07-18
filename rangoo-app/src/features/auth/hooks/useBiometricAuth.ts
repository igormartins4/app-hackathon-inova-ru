import * as LocalAuthentication from 'expo-local-authentication'
import { useCallback } from 'react'
import { useI18n } from '@/shared/i18n'
import { useAuth } from './useAuth'

type BiometricResult = { success: true } | { success: false; reason: 'unavailable' | 'cancelled' }

// Biometria só serve para confirmar/restaurar uma sessão cujo JWT já está no
// SecureStore (ver useAuth.pendingUser) — nunca para preencher ou substituir
// o campo de senha (Especificacao Tecnica v2.0, secao 11.1).
export function useBiometricAuth() {
  const { pendingUser, confirmPendingSession } = useAuth()
  const { t } = useI18n()

  const authenticateWithBiometrics = useCallback(async (): Promise<BiometricResult> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    const isEnrolled = await LocalAuthentication.isEnrolledAsync()
    if (!hasHardware || !isEnrolled) {
      return { success: false, reason: 'unavailable' }
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t.loginBiometricPromptMessage,
      cancelLabel: t.cancel,
    })

    if (!result.success) {
      return { success: false, reason: 'cancelled' }
    }

    confirmPendingSession()
    return { success: true }
  }, [confirmPendingSession, t])

  return {
    hasPendingSession: !!pendingUser,
    pendingUserName: pendingUser?.nome ?? null,
    authenticateWithBiometrics,
  }
}

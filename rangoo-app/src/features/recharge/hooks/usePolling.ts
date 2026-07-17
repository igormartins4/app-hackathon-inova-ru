import { useCallback, useEffect, useRef } from 'react'
import { getPaymentStatus } from '../services/rechargeApi'
import type { PaymentStatusResponse } from '../types/recharge.types'
import { getNextDelay, shouldTimeout } from '../utils/polling'

interface UsePollingOptions {
  paymentId: number | null
  /** Timestamp (ms) when this payment was originally created — pass this when
   * resuming polling for a payment restored from storage, so the 120s ceiling
   * is measured from creation, not from remount. Defaults to Date.now(). */
  startedAt?: number
  onApproved: () => void
  onTerminal: (status: PaymentStatusResponse['status']) => void
  onTimeout: () => void
}

export function usePolling({
  paymentId,
  startedAt,
  onApproved,
  onTerminal,
  onTimeout,
}: UsePollingOptions) {
  const startRef = useRef<number>(Date.now())
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbacksRef = useRef({ onApproved, onTerminal, onTimeout })

  useEffect(() => {
    callbacksRef.current = { onApproved, onTerminal, onTimeout }
  }, [onApproved, onTerminal, onTimeout])

  const scheduleNext = useCallback((pollFn: () => void) => {
    const elapsed = Date.now() - startRef.current
    if (shouldTimeout(elapsed)) {
      callbacksRef.current.onTimeout()
      return
    }

    intervalRef.current = setTimeout(pollFn, getNextDelay(elapsed))
  }, [])

  const poll = useCallback(async () => {
    if (!paymentId) return

    const elapsed = Date.now() - startRef.current
    if (shouldTimeout(elapsed)) {
      callbacksRef.current.onTimeout()
      return
    }

    try {
      const res = await getPaymentStatus(paymentId)

      if (res.status === 'approved' && res.creditado === true) {
        callbacksRef.current.onApproved()
        return
      }

      if (res.status !== 'pending' && res.status !== 'approved') {
        callbacksRef.current.onTerminal(res.status)
        return
      }

      // approved but creditado !== true → keep polling (webhook pending)
      scheduleNext(poll)
    } catch {
      // Network error → keep trying until timeout
      scheduleNext(poll)
    }
  }, [paymentId, scheduleNext])

  useEffect(() => {
    if (!paymentId) return

    startRef.current = startedAt ?? Date.now()
    poll()

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current)
    }
  }, [paymentId, startedAt, poll])
}

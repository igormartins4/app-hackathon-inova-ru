import { useEffect, useRef, useCallback } from 'react';
import { getPaymentStatus } from '../services/rechargeApi';
import type { PaymentStatusResponse } from '../types/recharge.types';

const BASE_INTERVALS = [3000, 5000, 8000, 13000];
const TIMEOUT_MS = 120_000;
const JITTER_MS = 1000;

function jitteredDelay(base: number): number {
  return base + Math.floor(Math.random() * JITTER_MS * 2) - JITTER_MS;
}

interface UsePollingOptions {
  paymentId: number | null;
  onApproved: () => void;
  onTerminal: (status: PaymentStatusResponse['status']) => void;
  onTimeout: () => void;
}

export function usePolling({ paymentId, onApproved, onTerminal, onTimeout }: UsePollingOptions) {
  const startRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    if (!paymentId) return;

    const elapsed = Date.now() - startRef.current;
    if (elapsed >= TIMEOUT_MS) {
      onTimeout();
      return;
    }

    try {
      const res = await getPaymentStatus(paymentId);

      if (res.status === 'approved' && res.creditado === true) {
        onApproved();
        return;
      }

      if (res.status !== 'pending' && res.status !== 'approved') {
        onTerminal(res.status);
        return;
      }

      // approved but creditado !== true → keep polling (webhook pending)
      scheduleNext();
    } catch {
      // Network error → keep trying until timeout
      scheduleNext();
    }
  }, [paymentId, onApproved, onTerminal, onTimeout]);

  const scheduleNext = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    if (elapsed >= TIMEOUT_MS) {
      onTimeout();
      return;
    }

    // Pick interval based on how many polls have elapsed
    const pollCount = Math.floor(elapsed / BASE_INTERVALS[0]);
    const baseIdx = Math.min(pollCount, BASE_INTERVALS.length - 1);
    const delay = jitteredDelay(BASE_INTERVALS[baseIdx]);

    intervalRef.current = setTimeout(poll, delay);
  }, [poll, onTimeout]);

  useEffect(() => {
    if (!paymentId) return;

    startRef.current = Date.now();
    // First poll immediately
    poll();

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [paymentId, poll]);
}

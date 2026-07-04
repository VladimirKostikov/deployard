import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ToastInput, ToastItem, ToastPhase } from './toast-types';

const ENTER_MS = 280;
const VISIBLE_MS = 4200;
const LEAVE_MS = 280;

interface ToastContextValue {
  push: (toast: ToastInput) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  active: ToastItem | null;
  phase: ToastPhase | 'idle';
}

const ToastContext = createContext<ToastContextValue | null>(null);

function createToastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  const [active, setActive] = useState<ToastItem | null>(null);
  const [phase, setPhase] = useState<ToastPhase | 'idle'>('idle');
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
  }, []);

  const push = useCallback((toast: ToastInput) => {
    setQueue((current) => [...current, { ...toast, id: createToastId() }]);
  }, []);

  const success = useCallback((message: string) => push({ variant: 'success', message }), [push]);
  const error = useCallback((message: string) => push({ variant: 'error', message }), [push]);
  const info = useCallback((message: string) => push({ variant: 'info', message }), [push]);

  useEffect(() => {
    if (active || queue.length === 0) {
      return;
    }

    const [next, ...rest] = queue;
    setQueue(rest);
    setActive(next);
    setPhase('enter');

    schedule(() => setPhase('visible'), ENTER_MS);
  }, [active, queue, schedule]);

  useEffect(() => {
    if (phase !== 'visible' || !active) {
      return;
    }

    schedule(() => setPhase('leave'), VISIBLE_MS);
  }, [phase, active, schedule]);

  useEffect(() => {
    if (phase !== 'leave' || !active) {
      return;
    }

    schedule(() => {
      setActive(null);
      setPhase('idle');
    }, LEAVE_MS);
  }, [phase, active, schedule]);

  useEffect(() => clearTimers, [clearTimers]);

  const value = useMemo(
    () => ({ push, success, error, info, active, phase }),
    [push, success, error, info, active, phase],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}

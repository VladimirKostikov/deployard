import { useToastContext } from './toast-context';

export function ToastViewport() {
  const { active, phase } = useToastContext();

  if (!active) {
    return null;
  }

  const phaseClass =
    phase === 'enter'
      ? 'toast-phase-enter'
      : phase === 'leave'
        ? 'toast-phase-leave'
        : 'toast-phase-visible';

  return (
    <div className="pointer-events-none fixed bottom-4 left-3 right-3 z-[100] flex flex-col items-stretch sm:left-auto sm:max-w-sm sm:items-end">
      <div
        role="status"
        aria-live="polite"
        className={`toast-panel w-full sm:max-w-sm ${phaseClass}`}
      >
        {active.message}
      </div>
    </div>
  );
}

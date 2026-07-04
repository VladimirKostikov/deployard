import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const TRANSITION_MS = 320;

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  overlayClassName?: string;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  panelClassName,
  overlayClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        setVisible(true);
      });

      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), TRANSITION_MS);

    return () => window.clearTimeout(timer);
  }, [open]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={[
        'fixed inset-0 z-[200] flex items-end justify-center p-3 sm:items-center sm:p-4',
        'bg-black/30 transition-opacity duration-300 ease-out motion-reduce:transition-none',
        visible ? 'opacity-100' : 'opacity-0',
        overlayClassName,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
        className={[
          'max-h-[90dvh] w-full max-w-lg overflow-y-auto border border-border bg-elevated p-4 shadow-sm sm:p-6',
          'transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-[0.99] opacity-0',
          panelClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold text-primary">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary transition-colors hover:text-primary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

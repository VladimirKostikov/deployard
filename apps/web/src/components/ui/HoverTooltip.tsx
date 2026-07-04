import { useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface HoverTooltipProps {
  label: string;
  children: ReactNode;
}

export function HoverTooltip({ label, children }: HoverTooltipProps) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

  const showTooltip = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  return (
    <>
      <span
        ref={anchorRef}
        className="inline-flex"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </span>
      {tooltip &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
            className="pointer-events-none z-[100] whitespace-nowrap rounded-apple border border-border bg-elevated px-2.5 py-1.5 text-xs font-medium text-primary shadow-sm"
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
}

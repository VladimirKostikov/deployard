import type { ReactNode } from 'react';

interface ImportSectionProps {
  step: number;
  title: string;
  hint?: string;
  muted?: boolean;
  children: ReactNode;
}

export function ImportSection({ step, title, hint, muted = false, children }: ImportSectionProps) {
  return (
    <section
      className={`space-y-4 border border-border p-5 ${
        muted ? 'bg-canvas opacity-60' : 'bg-elevated'
      }`}
      aria-disabled={muted}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-black text-sm font-semibold text-white">
          {step}
        </span>
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-primary">{title}</h2>
          {hint && <p className="text-sm text-secondary">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

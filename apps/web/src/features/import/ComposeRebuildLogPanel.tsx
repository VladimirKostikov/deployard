import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ComposeRebuildStatus } from './use-compose-rebuild';

interface ComposeRebuildLogPanelProps {
  lines: string[];
  status: ComposeRebuildStatus;
}

export function ComposeRebuildLogPanel({ lines, status }: ComposeRebuildLogPanelProps) {
  const { t } = useTranslation('import');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [lines]);

  if (status === 'idle' && lines.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden border border-border bg-canvas">
      <div className="border-b border-border px-3 py-2 text-xs text-secondary">
        {status === 'running'
          ? t('flow.rebuildLogRunning')
          : status === 'success'
            ? t('flow.rebuildLogSuccess')
            : status === 'error'
              ? t('flow.rebuildLogError')
              : t('flow.rebuildLogTitle')}
      </div>
      <div
        ref={containerRef}
        className="h-48 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed text-primary"
      >
        {lines.length === 0 ? (
          <p className="text-secondary">{t('flow.rebuildLogWaiting')}</p>
        ) : (
          lines.map((line, index) => (
            <div key={`${index}-${line.slice(0, 16)}`} className="whitespace-pre-wrap break-all">
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

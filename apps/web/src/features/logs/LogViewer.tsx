import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/ui/Card';
import { usePodLogStream } from './usePodLogStream';

interface LogViewerProps {
  namespace: string;
  deployment: string;
  podName: string;
}

export function LogViewer({ namespace, deployment, podName }: LogViewerProps) {
  const { t } = useTranslation('logs');
  const { lines, isStreaming, hasError, autoScrollRef } = usePodLogStream(namespace, deployment, podName);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScrollRef.current || !containerRef.current) {
      return;
    }
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [lines, autoScrollRef]);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <h3 className="text-sm font-medium text-primary">{t('title')}</h3>
          <p className="text-xs text-secondary">{podName}</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-secondary">
          <input
            type="checkbox"
            defaultChecked
            onChange={(event) => {
              autoScrollRef.current = event.target.checked;
            }}
            className="accent-accent"
          />
          {t('autoScroll')}
        </label>
      </div>

      <div
        ref={containerRef}
        className="h-72 overflow-y-auto bg-canvas px-5 py-4 font-mono text-xs leading-relaxed text-primary"
      >
        {hasError && <p className="text-danger">{t('error')}</p>}
        {!hasError && lines.length === 0 && (
          <p className="text-secondary">{isStreaming ? t('streaming') : t('empty')}</p>
        )}
        {lines.map((line, index) => (
          <div key={`${index}-${line.slice(0, 12)}`} className="whitespace-pre-wrap break-all">
            {line}
          </div>
        ))}
      </div>
    </Card>
  );
}

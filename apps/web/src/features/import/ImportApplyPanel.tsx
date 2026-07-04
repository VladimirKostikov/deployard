import { useTranslation } from 'react-i18next';
import { AppSection } from '@dpd/shared';
import { useSectionAccess } from '../../auth/use-access';
import { Button } from '../../components/ui/Button';
import type { ImportApplyProgress } from './import-apply-progress';

interface ImportApplyPanelProps {
  namespace: string;
  ready: boolean;
  isApplying: boolean;
  progress: ImportApplyProgress | null;
  onApply: () => void;
}

export function ImportApplyPanel({
  namespace,
  ready,
  isApplying,
  progress,
  onApply,
}: ImportApplyPanelProps) {
  const { t } = useTranslation('import');
  const { canManage } = useSectionAccess(AppSection.IMPORT, namespace);

  const phaseLabel = progress
    ? t(`flow.importPhase.${progress.phase}`)
    : null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        {ready ? t('flow.importReady') : t('flow.previewRequired')}
      </p>

      {progress ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs text-secondary">
            <span>{phaseLabel}</span>
            <span>{progress.percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      ) : null}

      {canManage ? (
        <Button
          type="button"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={!ready || isApplying}
          onClick={onApply}
        >
          {isApplying ? t('actions.applying') : t('actions.apply')}
        </Button>
      ) : (
        <p className="text-sm text-secondary">{t('flow.applyReadOnly')}</p>
      )}
    </div>
  );
}

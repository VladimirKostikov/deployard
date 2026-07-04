import type { ComposeUpResult } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { ComposeRebuildLogPanel } from './ComposeRebuildLogPanel';
import { useComposeRebuild } from './use-compose-rebuild';

interface ComposeRebuildPanelProps {
  projectId: string;
  namespace?: string;
  partOf?: string;
  clusterContext?: string;
  imageOverrides?: Record<string, string>;
  syncToCluster?: boolean;
  canRebuild: boolean;
  rebuildUnavailableReason?: 'dockerUnavailable' | null;
  hint?: string;
  buttonVariant?: 'primary' | 'secondary';
  onSuccess?: (result: ComposeUpResult) => void;
}

export function ComposeRebuildPanel({
  projectId,
  namespace,
  partOf,
  clusterContext,
  imageOverrides,
  syncToCluster = true,
  canRebuild,
  rebuildUnavailableReason,
  hint,
  buttonVariant = 'primary',
  onSuccess,
}: ComposeRebuildPanelProps) {
  const { t } = useTranslation('import');
  const rebuild = useComposeRebuild({ onSuccess });

  if (!canRebuild && !rebuildUnavailableReason) {
    return null;
  }

  if (!canRebuild && rebuildUnavailableReason) {
    return (
      <div className="space-y-1 border border-dashed border-default bg-canvas p-4">
        <p className="text-sm font-medium text-primary">{t('flow.rebuildTitle')}</p>
        <p className="text-xs text-secondary">{t('flow.rebuildUnavailableDocker')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 border border-border p-4">
      <div>
        <p className="text-sm font-medium text-primary">{t('flow.rebuildTitle')}</p>
        <p className="mt-1 text-xs leading-relaxed text-secondary">
          {hint ?? t('flow.rebuildHint')}
        </p>
      </div>

      <Button
        type="button"
        variant={buttonVariant}
        size="sm"
        disabled={rebuild.isRunning}
        onClick={() =>
          rebuild.start({
            projectId,
            imageOverrides,
            namespace,
            partOf,
            syncToCluster,
            clusterContext,
          })
        }
      >
        {rebuild.isRunning ? t('flow.rebuilding') : t('flow.rebuildSubmit')}
      </Button>

      <ComposeRebuildLogPanel lines={rebuild.lines} status={rebuild.status} />
    </div>
  );
}

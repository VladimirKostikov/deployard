import type { ComposeProjectSummary } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { ComposeControlPanel } from './ComposeControlPanel';
import { ComposeRebuildPanel } from './ComposeRebuildPanel';

interface ImportSelectedProjectPanelProps {
  namespace: string;
  project: ComposeProjectSummary;
  canRebuild: boolean;
  rebuildUnavailableReason: 'dockerUnavailable' | null;
  imageOverrides?: Record<string, string>;
  onRebuildSuccess?: (result: import('@dpd/shared').ComposeUpResult) => void;
}

export function ImportSelectedProjectPanel({
  namespace,
  project,
  canRebuild,
  rebuildUnavailableReason,
  imageOverrides,
  onRebuildSuccess,
}: ImportSelectedProjectPanelProps) {
  const { t } = useTranslation('import');

  return (
    <div className="space-y-3 border border-border bg-elevated p-4">
      <div>
        <p className="text-sm font-medium text-primary">{t('selectedProjectSettingsTitle')}</p>
        <p className="mt-1 text-xs text-secondary">
          {project.source === 'file' ? t('projectGroups.file') : t('projectGroups.docker')}
          {' · '}
          {project.name}
        </p>
        {project.composeFile ? (
          <p className="mt-1 text-xs text-secondary">
            {t('selectedComposeFile', { path: project.composeFile })}
          </p>
        ) : null}
      </div>

      <ComposeRebuildPanel
        projectId={project.id}
        namespace={namespace}
        partOf={project.name}
        imageOverrides={imageOverrides}
        canRebuild={canRebuild}
        rebuildUnavailableReason={rebuildUnavailableReason}
        buttonVariant="secondary"
        onSuccess={onRebuildSuccess}
      />

      {project.source === 'file' && (
        <ComposeControlPanel projectId={project.id} variant="secondary" />
      )}
    </div>
  );
}

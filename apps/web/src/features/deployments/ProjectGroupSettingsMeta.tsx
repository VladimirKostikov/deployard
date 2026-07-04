import type { ComposeProjectSummary } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../components/ui/Badge';
import { StatusIndicator } from '../../components/ui/StatusIndicator';

interface ProjectGroupSettingsMetaProps {
  label: string;
  serviceCount: number;
  composeProject: ComposeProjectSummary | undefined;
  dockerAvailable: boolean;
  dockerMessage?: string;
}

export function ProjectGroupSettingsMeta({
  label,
  serviceCount,
  composeProject,
  dockerAvailable,
  dockerMessage,
}: ProjectGroupSettingsMetaProps) {
  const { t } = useTranslation(['deployments', 'import']);

  return (
    <div className="space-y-4 border border-border bg-canvas p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-secondary">{t('deployments:projectGroups.settingsGroupLabel')}</p>
        <p className="mt-1 text-base font-semibold text-primary">{label}</p>
        <p className="mt-1 text-xs text-secondary">
          {t('deployments:projectGroups.services', { count: serviceCount })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <StatusIndicator variant={dockerAvailable ? 'ok' : 'warn'} className="text-xs">
          {dockerAvailable
            ? t('deployments:projectGroups.settingsDockerReady')
            : t('deployments:projectGroups.settingsDockerUnavailable')}
        </StatusIndicator>
        {composeProject ? (
          <Badge>
            {composeProject.source === 'file'
              ? t('import:projectGroups.file')
              : t('import:projectGroups.docker')}
          </Badge>
        ) : null}
      </div>

      {composeProject?.composeFile ? (
        <p className="text-xs text-secondary">
          {t('import:selectedComposeFile', { path: composeProject.composeFile })}
        </p>
      ) : null}

      {!dockerAvailable && dockerMessage ? (
        <p className="text-xs text-secondary">{dockerMessage}</p>
      ) : null}
    </div>
  );
}

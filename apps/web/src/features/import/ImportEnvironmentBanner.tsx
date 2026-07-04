import type { ImportEnvironmentStatus } from '@dpd/shared';
import { useTranslation } from 'react-i18next';
import { StatusIndicator } from '../../components/ui/StatusIndicator';

interface ImportEnvironmentBannerProps {
  status: ImportEnvironmentStatus;
}

export function ImportEnvironmentBanner({ status }: ImportEnvironmentBannerProps) {
  const { t } = useTranslation('import');

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <StatusIndicator variant={status.dockerAvailable ? 'ok' : 'off'}>
        <span>{t('environment.docker')}</span>
        <span className="text-secondary">
          {status.dockerAvailable ? t('environment.available') : t('environment.unavailable')}
        </span>
      </StatusIndicator>
      <StatusIndicator variant={status.kindAvailable ? 'ok' : 'off'}>
        <span>{t('environment.kind')}</span>
        <span className="text-secondary">
          {status.kindAvailable
            ? t('environment.kindReady', { cluster: status.kindClusterName })
            : t('environment.kindMissing', { cluster: status.kindClusterName })}
        </span>
      </StatusIndicator>
    </div>
  );
}

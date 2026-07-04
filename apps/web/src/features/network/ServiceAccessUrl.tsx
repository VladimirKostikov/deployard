import { useTranslation } from 'react-i18next';
import type { ServiceSummary } from '@dpd/shared';
import { resolveServiceAccess } from './resolve-service-access';
import { useServiceAccessUrl } from './use-service-access-url';

interface ServiceAccessUrlProps {
  service: ServiceSummary;
}

export function ServiceAccessUrl({ service }: ServiceAccessUrlProps) {
  const { t } = useTranslation('network');
  const access = resolveServiceAccess(service);
  const accessQuery = useServiceAccessUrl(service);

  if (!access) {
    return null;
  }

  const accessUrl = accessQuery.data?.url;

  if (accessUrl) {
    return (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-xs font-medium text-primary" title={service.name}>
          {service.name}
        </span>
        <a
          href={accessUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block max-w-[14rem] truncate font-mono text-xs text-accent underline-offset-2 hover:underline"
          title={t('services.actions.accessUrlTitle', {
            service: service.name,
            namespace: service.namespace,
            url: accessUrl,
          })}
        >
          {accessUrl}
        </a>
      </div>
    );
  }

  if (accessQuery.isLoading) {
    return <span className="text-xs text-secondary">{t('services.actions.accessUrlLoading')}</span>;
  }

  return null;
}

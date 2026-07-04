import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ServiceSummary } from '@dpd/shared';
import { api } from '../../api';
import { OpenIcon } from '../../components/icons/ActionIcons';
import { useToast } from '../../components/ui/toast/use-toast';
import { resolveServiceAccess } from './resolve-service-access';
import { useServiceAccessUrl } from './use-service-access-url';

interface ServiceAccessButtonProps {
  service: ServiceSummary;
}

const actionButtonClass =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-elevated text-secondary transition-all hover:border-accent/40 hover:bg-canvas hover:text-accent disabled:cursor-wait disabled:opacity-60';

export function ServiceAccessButton({ service }: ServiceAccessButtonProps) {
  const { t } = useTranslation(['network', 'toast']);
  const toast = useToast();
  const access = resolveServiceAccess(service);
  const accessQuery = useServiceAccessUrl(service);
  const [pending, setPending] = useState(false);

  if (!access) {
    return null;
  }

  const resolveUrl = async (): Promise<string> => {
    if (accessQuery.data?.url) {
      return accessQuery.data.url;
    }

    const result = await api.prepareServiceAccess({
      namespace: service.namespace,
      serviceName: service.name,
      servicePort: access.servicePort,
    });

    return result.url;
  };

  const handleOpen = () => {
    if (pending) {
      return;
    }

    setPending(true);

    void resolveUrl()
      .then((url) => {
        const tab = window.open(url, '_blank');
        if (!tab) {
          toast.error(t('toast:network.openBlocked'));
          return;
        }

        void accessQuery.refetch();
        toast.success(t('toast:network.openSuccess', { url }));
      })
      .catch(() => {
        toast.error(t('toast:network.openError', { name: service.name }));
      })
      .finally(() => {
        setPending(false);
      });
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={pending}
      aria-label={t('network:services.actions.open', { name: service.name })}
      className={actionButtonClass}
    >
      <OpenIcon />
    </button>
  );
}

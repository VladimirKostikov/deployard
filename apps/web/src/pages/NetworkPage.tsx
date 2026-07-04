import { AppSection } from '@dpd/shared';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useSectionAccess } from '../auth/use-access';
import { NamespaceSelector } from '../components/NamespaceSelector';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { EndpointTable } from '../features/network/EndpointTable';
import { NetworkIngressPanel } from '../features/network/NetworkIngressPanel';
import { ServiceCreateForm } from '../features/network/ServiceCreateForm';
import { ServiceTable } from '../features/network/ServiceTable';
import { parseNetworkTab, type NetworkTab } from '../features/network/network-tabs';
import { useEndpoints, useServices } from '../hooks/kubernetes/useNetwork';

interface NetworkPageProps {
  namespace: string;
  onNamespaceChange: (namespace: string) => void;
}

export function NetworkPage({ namespace, onNamespaceChange }: NetworkPageProps) {
  const { t } = useTranslation('network');
  const { canManage } = useSectionAccess(AppSection.NETWORK, namespace);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseNetworkTab(searchParams.get('tab'));

  const servicesQuery = useServices(namespace);
  const endpointsQuery = useEndpoints(namespace);
  const deploymentsQuery = useQuery({
    queryKey: ['deployments', namespace],
    queryFn: () => api.getDeployments(namespace),
    enabled: Boolean(namespace),
  });

  const setTab = (next: NetworkTab) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    setSearchParams(params);
  };

  const tabOptions: Array<{ value: NetworkTab; label: string }> = [
    { value: 'services', label: t('tabs.services') },
    { value: 'endpoints', label: t('tabs.endpoints') },
    { value: 'ingress', label: t('tabs.ingress') },
  ];

  const deploymentNames = (deploymentsQuery.data ?? []).map((deployment) => deployment.name);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">{t('title')}</h1>
        </div>
        <NamespaceSelector value={namespace} onChange={onNamespaceChange} />
      </div>

      <Tabs value={tab} options={tabOptions} onChange={setTab} ariaLabel={t('tabs.ariaLabel')} />

      {tab === 'services' && (
        <div className="space-y-4">
          {canManage ? (
            <div className="flex justify-end">
              <ServiceCreateForm namespace={namespace} deploymentOptions={deploymentNames} />
            </div>
          ) : null}
          {servicesQuery.isLoading ? (
            <p className="text-sm text-secondary">{t('services.loading')}</p>
          ) : servicesQuery.isError ? (
            <Card className="border-danger/30 bg-danger-soft p-5 text-sm text-danger">{t('services.error')}</Card>
          ) : (
            <ServiceTable namespace={namespace} services={servicesQuery.data ?? []} />
          )}
        </div>
      )}

      {tab === 'endpoints' && (
        <div className="space-y-4">
          {endpointsQuery.isLoading ? (
            <p className="text-sm text-secondary">{t('endpoints.loading')}</p>
          ) : endpointsQuery.isError ? (
            <Card className="border-danger/30 bg-danger-soft p-5 text-sm text-danger">{t('endpoints.error')}</Card>
          ) : (
            <EndpointTable endpoints={endpointsQuery.data ?? []} />
          )}
        </div>
      )}

      {tab === 'ingress' && <NetworkIngressPanel namespace={namespace} canManage={canManage} />}
    </div>
  );
}

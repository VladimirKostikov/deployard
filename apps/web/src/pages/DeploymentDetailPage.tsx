import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { ALL_NAMESPACES, AppSection } from '@dpd/shared';
import { useDeployment, usePodWatch, usePods } from '../hooks/kubernetes';
import { useSectionAccess } from '../auth/use-access';
import { DeploymentConfigTab } from '../features/deployments/DeploymentConfigTab';
import { DeploymentFilesTab } from '../features/deployments/DeploymentFilesTab';
import { DeploymentHealthTab } from '../features/deployments/DeploymentHealthTab';
import { DeploymentHistory } from '../features/deployments/DeploymentHistory';
import { DeploymentLogsSection } from '../features/deployments/DeploymentLogsSection';
import { DeploymentOverview } from '../features/deployments/DeploymentOverview';
import { DeploymentRolloutBanner } from '../features/deployments/DeploymentRolloutBanner';
import { DeploymentScaleControl } from '../features/deployments/DeploymentScaleControl';
import { DeploymentLifecycleControls } from '../features/deployments/DeploymentLifecycleControls';
import { DeploymentImageControl } from '../features/deployments/DeploymentWriteControls';
import { DeploymentNetworkSection } from '../features/network/DeploymentNetworkSection';
import { isDeploymentRolloutInProgress } from '../features/deployments/deployment-rollout';
import { parseDeploymentTab, type DeploymentTab } from '../features/deployments/deployment-tabs';
import { PodConsole } from '../features/pods/PodConsole';
import { PodTable } from '../features/pods/PodTable';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';

interface DeploymentDetailPageProps {
  namespace: string;
}

export function DeploymentDetailPage({ namespace: fallbackNamespace }: DeploymentDetailPageProps) {
  const { t } = useTranslation('deployments');
  const { name = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [restartPending, setRestartPending] = useState(false);
  const namespaceParam = searchParams.get('namespace');
  const namespace =
    namespaceParam && namespaceParam !== ALL_NAMESPACES ? namespaceParam : fallbackNamespace;
  const tab = parseDeploymentTab(searchParams.get('tab'));
  const selectedPod = searchParams.get('pod') ?? '';
  const { canOperate } = useSectionAccess(AppSection.DEPLOYMENTS, namespace);
  const { data: deployment, isLoading, isError } = useDeployment(namespace, name);
  const { data: pods } = usePods(namespace, name);
  const rolloutSeenRef = useRef(false);
  usePodWatch(namespace, name);

  useEffect(() => {
    if (!restartPending || !deployment) {
      return;
    }

    if (isDeploymentRolloutInProgress(deployment)) {
      rolloutSeenRef.current = true;
      return;
    }

    if (rolloutSeenRef.current) {
      setRestartPending(false);
      rolloutSeenRef.current = false;
    }
  }, [restartPending, deployment]);

  useEffect(() => {
    if (!restartPending) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setRestartPending(false);
      rolloutSeenRef.current = false;
    }, 120_000);

    return () => window.clearTimeout(timeout);
  }, [restartPending]);

  const setTab = (next: DeploymentTab) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    if (next !== 'console' && next !== 'logs' && next !== 'files') {
      params.delete('pod');
    }
    setSearchParams(params);
  };

  const handleRestartStarted = () => {
    rolloutSeenRef.current = false;
    setRestartPending(true);
    setTab('pods');
  };

  const setSelectedPod = (podName: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('pod', podName);
    setSearchParams(params);
  };

  if (isLoading) {
    return <p className="text-sm text-secondary">{t('detail.loading')}</p>;
  }

  if (isError || !deployment) {
    return (
      <Card className="border-danger/30 bg-danger-soft p-5 text-sm text-danger">
        {t('detail.error')}
      </Card>
    );
  }

  const tabOptions: Array<{ value: DeploymentTab; label: string }> = [
    { value: 'overview', label: t('tabs.overview') },
    { value: 'health', label: t('tabs.health') },
    { value: 'config', label: t('tabs.config') },
    { value: 'history', label: t('tabs.history') },
    { value: 'pods', label: t('tabs.pods') },
    { value: 'files', label: t('tabs.files') },
    { value: 'logs', label: t('tabs.logs') },
    ...(canOperate ? [{ value: 'console' as const, label: t('tabs.console') }] : []),
  ];

  return (
    <div className="space-y-6">
      <DeploymentOverview name={name} namespace={namespace} deployment={deployment} />

      <DeploymentRolloutBanner deployment={deployment} restartPending={restartPending} />

      <Tabs value={tab} options={tabOptions} onChange={setTab} ariaLabel={t('tabs.ariaLabel')} />

      {tab === 'overview' && (
        <div className="space-y-4">
          <DeploymentNetworkSection namespace={namespace} deploymentName={name} />
          <DeploymentImageControl namespace={namespace} name={name} image={deployment.image} />
          <DeploymentScaleControl namespace={namespace} name={name} deployment={deployment} />
          <DeploymentLifecycleControls
            namespace={namespace}
            name={name}
            deployment={deployment}
            onRestartStarted={handleRestartStarted}
          />
        </div>
      )}

      {tab === 'health' && <DeploymentHealthTab namespace={namespace} name={name} />}

      {tab === 'config' && <DeploymentConfigTab namespace={namespace} name={name} />}

      {tab === 'history' && (
        <DeploymentHistory
          namespace={namespace}
          deploymentName={name}
          currentRevision={deployment.revision}
        />
      )}

      {tab === 'pods' && <PodTable namespace={namespace} deploymentName={name} />}

      {tab === 'files' && (
        <DeploymentFilesTab
          namespace={namespace}
          deploymentName={name}
          pods={pods ?? []}
          selectedPod={selectedPod}
          onPodChange={setSelectedPod}
        />
      )}

      {tab === 'logs' && (
        <DeploymentLogsSection
          namespace={namespace}
          pods={pods}
          selectedPod={selectedPod}
          onPodChange={setSelectedPod}
        />
      )}

      {tab === 'console' && (
        <PodConsole
          namespace={namespace}
          deploymentName={name}
          pods={pods ?? []}
          selectedPod={selectedPod}
          onPodChange={setSelectedPod}
        />
      )}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import { usePods } from '../../hooks/kubernetes/usePods';
import { collectPodBlockers, isContainerErrorState } from './deployment-pod-blockers';

interface DeploymentStatusPodsProps {
  namespace: string;
  deploymentName: string;
  enabled: boolean;
}

export function DeploymentStatusPods({
  namespace,
  deploymentName,
  enabled,
}: DeploymentStatusPodsProps) {
  const { t } = useTranslation('deployments');
  const { data: pods, isLoading } = usePods(namespace, deploymentName, { enabled });

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return <p className="text-sm text-secondary">{t('statusModal.podsLoading')}</p>;
  }

  if (!pods?.length) {
    return <p className="text-sm text-secondary">{t('statusModal.podsEmpty')}</p>;
  }

  const blockers = collectPodBlockers(pods);
  const hasErrors = blockers.some((blocker) => isContainerErrorState(blocker.state));

  return (
    <div className="space-y-2">
      <p className="font-medium text-primary">{t('statusModal.podsTitle')}</p>

      {hasErrors ? (
        <p className="text-sm text-secondary">{t('statusModal.podsHint')}</p>
      ) : null}

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-canvas text-secondary">
            <tr>
              <th className="px-3 py-2 font-medium">{t('statusModal.podsColumns.pod')}</th>
              <th className="px-3 py-2 font-medium">{t('statusModal.podsColumns.phase')}</th>
              <th className="px-3 py-2 font-medium">{t('statusModal.podsColumns.container')}</th>
              <th className="px-3 py-2 font-medium">{t('statusModal.podsColumns.state')}</th>
            </tr>
          </thead>
          <tbody>
            {blockers.map((blocker) => (
              <tr key={`${blocker.podName}-${blocker.containerName ?? 'pod'}`} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2 font-mono text-primary">{blocker.podName}</td>
                <td className="px-3 py-2 text-secondary">{blocker.phase}</td>
                <td className="px-3 py-2 text-secondary">{blocker.containerName ?? '—'}</td>
                <td className="px-3 py-2">
                  <p className="text-primary">
                    {t(`statusModal.containerStates.${blocker.state}`, {
                      defaultValue: blocker.state,
                    })}
                  </p>
                  {blocker.detail ? (
                    <p className="mt-1 text-secondary">{blocker.detail}</p>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

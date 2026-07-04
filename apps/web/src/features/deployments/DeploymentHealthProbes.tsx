import { useTranslation } from 'react-i18next';
import type { DeploymentHealthInsight, DeploymentProbeConfig } from '@dpd/shared';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { useDeploymentHealth } from '../../hooks/kubernetes/useDeploymentHealth';
import {
  podProbeStatusVariant,
  resolvePodProbeDisplayState,
} from './pod-probe-status';

interface DeploymentHealthProbesProps {
  namespace: string;
  deploymentName: string;
  enabled?: boolean;
}

export function DeploymentHealthProbes({
  namespace,
  deploymentName,
  enabled = true,
}: DeploymentHealthProbesProps) {
  const { t } = useTranslation('deployments');
  const { data, isLoading, isError } = useDeploymentHealth(namespace, deploymentName, enabled);

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return <p className="text-sm text-secondary">{t('healthProbes.loading')}</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-secondary">{t('healthProbes.error')}</p>;
  }

  return (
    <div className="space-y-4">
      <ProbeConfigTable probes={data.probes} />
      <PodProbeTable insight={data} />
    </div>
  );
}

function ProbeConfigTable({ probes }: { probes: DeploymentProbeConfig[] }) {
  const { t } = useTranslation('deployments');

  if (probes.length === 0) {
    return <p className="text-sm text-secondary">{t('healthProbes.empty')}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="font-medium text-primary">{t('healthProbes.configTitle')}</p>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-canvas text-secondary">
            <tr>
              <th className="px-3 py-2 font-medium">{t('healthProbes.columns.type')}</th>
              <th className="px-3 py-2 font-medium">{t('healthProbes.columns.mechanism')}</th>
              <th className="px-3 py-2 font-medium">{t('healthProbes.columns.target')}</th>
              <th className="px-3 py-2 font-medium">{t('healthProbes.columns.timing')}</th>
            </tr>
          </thead>
          <tbody>
            {probes.map((probe) => (
              <tr key={probe.type} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2 text-primary">{t(`healthProbes.types.${probe.type}`)}</td>
                <td className="px-3 py-2 text-secondary">
                  {t(`healthProbes.mechanisms.${probe.mechanism}`)}
                </td>
                <td className="px-3 py-2 text-secondary">{formatProbeTarget(probe)}</td>
                <td className="px-3 py-2 text-secondary">{formatProbeTiming(probe, t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PodProbeTable({ insight }: { insight: DeploymentHealthInsight }) {
  const { t } = useTranslation('deployments');

  if (insight.pods.length === 0) {
    return <p className="text-sm text-secondary">{t('healthProbes.podsEmpty')}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="font-medium text-primary">{t('healthProbes.podsTitle')}</p>
      <div className="overflow-x-auto border border-border">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-canvas text-secondary">
            <tr>
              <th className="px-3 py-2 font-medium">{t('healthProbes.columns.pod')}</th>
              <th className="px-3 py-2 font-medium">{t('healthProbes.columns.phase')}</th>
              <th className="px-3 py-2 font-medium">{t('healthProbes.columns.podStatus')}</th>
            </tr>
          </thead>
          <tbody>
            {insight.pods.map((pod) => {
              const displayState = resolvePodProbeDisplayState(pod);

              return (
              <tr key={pod.podName} className="border-b border-border last:border-b-0">
                <td className="px-3 py-2 font-mono text-primary">{pod.podName}</td>
                <td className="px-3 py-2 text-secondary">{pod.phase}</td>
                <td className="px-3 py-2">
                  <StatusIndicator variant={podProbeStatusVariant(displayState)} className="text-xs">
                    {t(`healthProbes.podStates.${displayState}`)}
                  </StatusIndicator>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatProbeTarget(probe: DeploymentProbeConfig): string {
  if (probe.mechanism === 'http') {
    return `GET :${probe.port ?? '?'}${probe.path ?? '/'}`;
  }
  if (probe.mechanism === 'tcp') {
    return `TCP :${probe.port ?? '?'}`;
  }
  if (probe.mechanism === 'exec') {
    return probe.command?.join(' ') ?? 'exec';
  }
  return '-';
}

function formatProbeTiming(
  probe: DeploymentProbeConfig,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const parts = [
    probe.initialDelaySeconds !== undefined
      ? t('healthProbes.timing.start', { seconds: probe.initialDelaySeconds })
      : null,
    probe.periodSeconds !== undefined
      ? t('healthProbes.timing.every', { seconds: probe.periodSeconds })
      : null,
    probe.timeoutSeconds !== undefined
      ? t('healthProbes.timing.timeout', { seconds: probe.timeoutSeconds })
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : '-';
}

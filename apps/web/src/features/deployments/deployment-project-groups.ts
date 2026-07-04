import type { DeploymentSummary } from '@dpd/shared';
import type { StatusVariant } from '../../components/ui/StatusIndicator';
import { isDeploymentHealthy, resolveDeploymentHealth } from './deployment-status-insight';

export const STANDALONE_PROJECT = '__standalone__';

export interface DeploymentProjectGroup {
  key: string;
  label: string;
  deployments: DeploymentSummary[];
}

export function listProjectGroupNames(deployments: DeploymentSummary[]): string[] {
  const names = new Set<string>();

  for (const deployment of deployments) {
    const partOf = deployment.partOf?.trim();
    if (partOf) {
      names.add(partOf);
    }
  }

  return [...names].sort((left, right) => left.localeCompare(right));
}

export function groupDeploymentsByProject(
  deployments: DeploymentSummary[],
  standaloneLabel: string,
  options?: { includeNamespace?: boolean },
): DeploymentProjectGroup[] {
  const grouped = new Map<string, DeploymentSummary[]>();

  for (const deployment of deployments) {
    const partOf = deployment.partOf?.trim();
    const projectKey = partOf || STANDALONE_PROJECT;
    const key = options?.includeNamespace
      ? `${deployment.namespace}/${projectKey}`
      : projectKey;
    const current = grouped.get(key) ?? [];
    current.push(deployment);
    grouped.set(key, current);
  }

  return [...grouped.entries()]
    .map(([key, items]) => {
      const sample = items[0];
      const partOf = sample?.partOf?.trim();
      const projectLabel = partOf || standaloneLabel;
      const label = options?.includeNamespace && sample
        ? `${sample.namespace} / ${projectLabel}`
        : projectLabel;

      return {
        key,
        label,
        deployments: [...items].sort((left, right) => left.name.localeCompare(right.name)),
      };
    })
    .sort((left, right) => {
      const leftStandalone = isStandaloneGroupKey(left.key);
      const rightStandalone = isStandaloneGroupKey(right.key);

      if (leftStandalone) {
        return 1;
      }
      if (rightStandalone) {
        return -1;
      }
      return left.label.localeCompare(right.label);
    });
}

function isStandaloneGroupKey(key: string): boolean {
  return key === STANDALONE_PROJECT || key.endsWith(`/${STANDALONE_PROJECT}`);
}

export function countHealthyDeployments(deployments: DeploymentSummary[]): number {
  return deployments.filter((deployment) => isDeploymentHealthy(deployment)).length;
}

export function resolveGroupStatusVariant(deployments: DeploymentSummary[]): StatusVariant {
  const states = deployments.map((deployment) => resolveDeploymentHealth(deployment));

  if (states.every((state) => state === 'healthy')) {
    return 'ok';
  }

  if (states.every((state) => state === 'healthy' || state === 'starting' || state === 'scaledToZero' || state === 'disabled')) {
    return 'idle';
  }

  return 'warn';
}

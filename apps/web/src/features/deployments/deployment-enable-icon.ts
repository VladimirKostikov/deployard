import type { DeploymentSummary } from '@dpd/shared';
import type { PodSummary } from '@dpd/shared';
import { collectPodBlockers, isContainerErrorState } from './deployment-pod-blockers';
import { resolveDeploymentHealth } from './deployment-status-insight';
import { deploymentIconButtonClass } from './deployment-icon-button';

export function deploymentHasPodErrors(pods: PodSummary[] | undefined): boolean {
  if (!pods?.length) {
    return false;
  }

  return collectPodBlockers(pods).some((blocker) => isContainerErrorState(blocker.state));
}

export function resolveEnableErrorHighlight(
  deployment: DeploymentSummary,
  pods: PodSummary[] | undefined,
  enableFailed: boolean,
): boolean {
  if (enableFailed) {
    return true;
  }

  if (deployment.disabledWithErrors) {
    return true;
  }

  if (deployment.disabled && deploymentHasPodErrors(pods)) {
    return true;
  }

  if (!deployment.disabled && resolveDeploymentHealth(deployment) === 'degraded') {
    return true;
  }

  return false;
}

export function buildEnableIconButtonClass(hasError: boolean, isPending: boolean): string {
  if (hasError) {
    return [
      deploymentIconButtonClass,
      'enable-play-button enable-play-button-error text-danger',
      'border-danger/50 bg-danger-soft/60 hover:border-danger/60 hover:bg-danger-soft/80',
      'focus-visible:ring-danger/40',
    ].join(' ');
  }

  if (isPending) {
    return [
      deploymentIconButtonClass,
      'enable-play-button text-success',
      'border-success/40 bg-success-soft/50',
      'focus-visible:ring-success/30',
    ].join(' ');
  }

  return [
    deploymentIconButtonClass,
    'enable-play-button text-success',
    'border-success/30 bg-success-soft/40 hover:border-success/50 hover:bg-success-soft/60',
    'focus-visible:ring-success/30',
  ].join(' ');
}

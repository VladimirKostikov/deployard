import type { DeploymentSummary } from '@dpd/shared';
import type { StatusVariant } from '../../components/ui/StatusIndicator';

export type DeploymentHealthState =
  | 'healthy'
  | 'starting'
  | 'restarting'
  | 'degraded'
  | 'scaledToZero'
  | 'disabled';

export type StatusReasonKey =
  | 'healthy'
  | 'starting'
  | 'scaledToZero'
  | 'disabled'
  | 'podsNotReady'
  | 'podsNotAvailable'
  | 'rolloutInProgress'
  | 'rolloutStalled';

const BOOTSTRAP_WINDOW_MS = 2 * 60 * 1000;

export function resolveDeploymentHealth(deployment: DeploymentSummary): DeploymentHealthState {
  if (deployment.disabled) {
    return 'disabled';
  }

  if (deployment.replicas === 0) {
    return 'scaledToZero';
  }

  if (deployment.readyReplicas === deployment.replicas) {
    return 'healthy';
  }

  if (deployment.updatedReplicas < deployment.replicas) {
    return 'starting';
  }

  const ageMs = Date.now() - Date.parse(deployment.createdAt);
  const inBootstrap =
    ageMs < BOOTSTRAP_WINDOW_MS &&
    deployment.readyReplicas === 0 &&
    deployment.availableReplicas === 0;

  if (inBootstrap) {
    return 'starting';
  }

  return 'degraded';
}

export function isDeploymentHealthy(deployment: DeploymentSummary): boolean {
  return resolveDeploymentHealth(deployment) === 'healthy';
}

export function collectStatusReasons(deployment: DeploymentSummary): StatusReasonKey[] {
  const state = resolveDeploymentHealth(deployment);

  if (state === 'healthy') {
    return ['healthy'];
  }

  if (state === 'scaledToZero') {
    return ['scaledToZero'];
  }

  if (state === 'disabled') {
    return ['disabled'];
  }

  if (state === 'starting') {
    const reasons: StatusReasonKey[] = ['starting'];
    if (deployment.updatedReplicas < deployment.replicas) {
      reasons.push('rolloutInProgress');
    }
    if (deployment.readyReplicas < deployment.replicas) {
      reasons.push('podsNotReady');
    }
    return reasons;
  }

  const reasons: StatusReasonKey[] = ['podsNotReady'];
  if (deployment.updatedReplicas >= deployment.replicas) {
    reasons.push('rolloutStalled');
  }
  if (deployment.availableReplicas < deployment.replicas) {
    reasons.push('podsNotAvailable');
  }
  return reasons;
}

export function deploymentStatusVariant(state: DeploymentHealthState): StatusVariant {
  if (state === 'healthy') {
    return 'ok';
  }
  if (state === 'degraded') {
    return 'warn';
  }
  if (state === 'scaledToZero') {
    return 'off';
  }
  if (state === 'disabled') {
    return 'off';
  }
  if (state === 'restarting') {
    return 'idle';
  }
  return 'idle';
}

export function resolveDeploymentDisplayState(
  deployment: DeploymentSummary,
  restartPending = false,
): DeploymentHealthState {
  if (restartPending) {
    return 'restarting';
  }

  return resolveDeploymentHealth(deployment);
}

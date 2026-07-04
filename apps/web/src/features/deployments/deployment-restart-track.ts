import type { DeploymentSummary } from '@dpd/shared';
import { isDeploymentRolloutInProgress } from './deployment-rollout';
import { isDeploymentHealthy } from './deployment-status-insight';

export interface DeploymentRestartTrack {
  startedAt: number;
  seenRollout: boolean;
  baselineRevision?: number;
}

export const RESTART_TRACK_TIMEOUT_MS = 120_000;
export const RESTART_MIN_VISIBLE_MS = 1_500;

export function deploymentRestartKey(namespace: string, name: string): string {
  return `${namespace}/${name}`;
}

export function syncDeploymentRestartTracks(
  tracks: Map<string, DeploymentRestartTrack>,
  deployments: DeploymentSummary[],
): Map<string, DeploymentRestartTrack> {
  if (tracks.size === 0) {
    return tracks;
  }

  const byKey = new Map(
    deployments.map((deployment) => [
      deploymentRestartKey(deployment.namespace, deployment.name),
      deployment,
    ]),
  );
  const next = new Map(tracks);
  const now = Date.now();

  for (const [key, track] of tracks) {
    const deployment = byKey.get(key);
    const elapsed = now - track.startedAt;

    if (!deployment) {
      next.delete(key);
      continue;
    }

    const updatedTrack: DeploymentRestartTrack = { ...track };
    if (updatedTrack.baselineRevision === undefined) {
      updatedTrack.baselineRevision = deployment.revision;
    }

    const rolloutActive = isDeploymentRolloutInProgress(deployment);
    if (rolloutActive) {
      updatedTrack.seenRollout = true;
    }

    if (
      !rolloutActive &&
      isDeploymentHealthy(deployment) &&
      elapsed >= RESTART_MIN_VISIBLE_MS
    ) {
      next.delete(key);
      continue;
    }

    if (updatedTrack.seenRollout && !rolloutActive && elapsed >= RESTART_MIN_VISIBLE_MS) {
      next.delete(key);
      continue;
    }

    if (
      updatedTrack.baselineRevision !== undefined &&
      deployment.revision > updatedTrack.baselineRevision &&
      isDeploymentHealthy(deployment) &&
      elapsed >= RESTART_MIN_VISIBLE_MS
    ) {
      next.delete(key);
      continue;
    }

    if (deployment.replicas === 0 && elapsed >= RESTART_MIN_VISIBLE_MS) {
      next.delete(key);
      continue;
    }

    if (elapsed >= RESTART_TRACK_TIMEOUT_MS) {
      next.delete(key);
      continue;
    }

    next.set(key, updatedTrack);
  }

  return next;
}

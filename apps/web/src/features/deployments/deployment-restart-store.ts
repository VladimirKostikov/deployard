import { useEffect, useSyncExternalStore } from 'react';
import type { DeploymentSummary } from '@dpd/shared';
import {
  deploymentRestartKey,
  syncDeploymentRestartTracks,
  type DeploymentRestartTrack,
} from './deployment-restart-track';

let tracks = new Map<string, DeploymentRestartTrack>();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return tracks;
}

export function markDeploymentsRestarting(namespace: string, names: string[]) {
  if (names.length === 0) {
    return;
  }

  const startedAt = Date.now();
  const next = new Map(tracks);

  for (const name of names) {
    next.set(deploymentRestartKey(namespace, name), {
      startedAt,
      seenRollout: false,
    });
  }

  tracks = next;
  emit();
}

export function clearDeploymentsRestarting(namespace: string, names: string[]) {
  if (names.length === 0) {
    return;
  }

  const next = new Map(tracks);
  let changed = false;

  for (const name of names) {
    const key = deploymentRestartKey(namespace, name);
    if (next.delete(key)) {
      changed = true;
    }
  }

  if (!changed) {
    return;
  }

  tracks = next;
  emit();
}

export function syncRestartTracksWithDeployments(deployments: DeploymentSummary[]) {
  const next = syncDeploymentRestartTracks(tracks, deployments);
  if (next === tracks) {
    return;
  }

  tracks = next;
  emit();
}

export function useDeploymentRestartStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    tracks: snapshot,
    isRestartPending: (namespace: string, name: string) =>
      snapshot.has(deploymentRestartKey(namespace, name)),
    countRestartPending: (items: DeploymentSummary[]) =>
      items.filter((deployment) =>
        snapshot.has(deploymentRestartKey(deployment.namespace, deployment.name)),
      ).length,
    countRestartPendingByNames: (namespace: string, names: string[]) =>
      names.filter((name) => snapshot.has(deploymentRestartKey(namespace, name))).length,
  };
}

export function useSyncDeploymentRestartTracks(deployments: DeploymentSummary[]) {
  useEffect(() => {
    syncRestartTracksWithDeployments(deployments);
  }, [deployments]);
}

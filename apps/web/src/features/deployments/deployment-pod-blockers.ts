import type { PodSummary } from '@dpd/shared';

export interface PodBlocker {
  podName: string;
  containerName?: string;
  phase: string;
  state: string;
  detail?: string;
}

const ERROR_STATES = new Set([
  'ImagePullBackOff',
  'ErrImagePull',
  'CrashLoopBackOff',
  'CreateContainerConfigError',
  'InvalidImageName',
  'CreateContainerError',
  'RunContainerError',
  'Error',
  'OOMKilled',
]);

export function isContainerErrorState(state: string): boolean {
  return ERROR_STATES.has(state) || state === 'terminated' || state === 'failed';
}

export function collectPodBlockers(pods: PodSummary[]): PodBlocker[] {
  const blockers: PodBlocker[] = [];

  for (const pod of pods) {
    if (pod.containers.length === 0) {
      if (pod.phase === 'Pending' || pod.phase === 'Failed') {
        blockers.push({
          podName: pod.name,
          phase: pod.phase,
          state: pod.phase.toLowerCase(),
        });
      }
      continue;
    }

    for (const container of pod.containers) {
      if (container.ready) {
        continue;
      }

      blockers.push({
        podName: pod.name,
        containerName: container.name,
        phase: pod.phase,
        state: container.state,
        detail: container.waitingMessage,
      });
    }
  }

  return blockers;
}

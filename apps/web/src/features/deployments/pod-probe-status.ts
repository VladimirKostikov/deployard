import type { DeploymentPodProbeState } from '@dpd/shared';
import type { StatusVariant } from '../../components/ui/StatusIndicator';

export type PodProbeDisplayState =
  | 'ready'
  | 'runningNotReady'
  | 'pending'
  | 'failed'
  | 'notReady';

export function resolvePodProbeDisplayState(pod: DeploymentPodProbeState): PodProbeDisplayState {
  if (pod.readinessPassed) {
    return 'ready';
  }

  if (pod.phase === 'Failed') {
    return 'failed';
  }

  if (pod.started && pod.phase === 'Running') {
    return 'runningNotReady';
  }

  if (pod.phase === 'Pending') {
    return 'pending';
  }

  return 'notReady';
}

export function podProbeStatusVariant(state: PodProbeDisplayState): StatusVariant {
  if (state === 'ready') {
    return 'ok';
  }

  if (state === 'failed') {
    return 'error';
  }

  if (state === 'runningNotReady' || state === 'notReady') {
    return 'warn';
  }

  return 'idle';
}

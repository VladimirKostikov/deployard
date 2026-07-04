export type PodPhase = 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'Unknown';

export interface PodSummary {
  name: string;
  namespace: string;
  phase: PodPhase;
  ready: boolean;
  restarts: number;
  nodeName?: string;
  podIp?: string;
  hostIp?: string;
  ports: number[];
  startedAt?: string;
  containers: PodContainerStatus[];
}

export interface PodContainerStatus {
  name: string;
  ready: boolean;
  restartCount: number;
  state: string;
  image: string;
  waitingMessage?: string;
}

export interface ProbeStatus {
  type: 'readiness' | 'liveness' | 'startup';
  success: boolean;
  lastProbeTime?: string;
  message?: string;
}

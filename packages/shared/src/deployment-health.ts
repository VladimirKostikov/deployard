export type ProbeType = 'readiness' | 'liveness' | 'startup';
export type ProbeMechanism = 'http' | 'tcp' | 'exec' | 'grpc' | 'none';

export interface DeploymentProbeConfig {
  type: ProbeType;
  mechanism: ProbeMechanism;
  path?: string;
  port?: number;
  command?: string[];
  initialDelaySeconds?: number;
  periodSeconds?: number;
  timeoutSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}

export interface DeploymentPodProbeState {
  podName: string;
  containerName: string;
  ready: boolean;
  started: boolean;
  readinessPassed: boolean;
  phase: string;
}

export interface DeploymentHealthInsight {
  containerName: string;
  probes: DeploymentProbeConfig[];
  pods: DeploymentPodProbeState[];
}

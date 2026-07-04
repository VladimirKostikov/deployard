import type { DeploymentProbeConfig } from './deployment-health';

export interface ContainerEnvVar {
  name: string;
  value: string;
}

export interface DeploymentConfigSummary {
  containerPort: number;
  env: ContainerEnvVar[];
  containerName: string;
  probes: DeploymentProbeConfig[];
}

export interface ImageDefaultsResponse {
  image: string;
  containerPort: number;
  probeKind: 'http' | 'tcp' | 'none';
  env: ContainerEnvVar[];
  hint?: string;
}

export interface UpdateDeploymentConfigRequest {
  env: ContainerEnvVar[];
}

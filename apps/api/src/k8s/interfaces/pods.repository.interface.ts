import { PodSummary } from '@dpd/shared';

export interface IPodsRepository {
  listByDeployment(namespace: string, deploymentName: string): Promise<PodSummary[]>;
  listByNamespace(namespace: string): Promise<PodSummary[]>;
  isPodInDeployment(namespace: string, deploymentName: string, podName: string): Promise<boolean>;
  deletePod(namespace: string, name: string): Promise<void>;
}

export const PODS_REPOSITORY = Symbol('PODS_REPOSITORY');

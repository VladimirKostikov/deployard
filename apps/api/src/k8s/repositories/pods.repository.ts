import { Injectable } from '@nestjs/common';
import { ApiErrorCode, PodSummary } from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { IPodsRepository } from '../interfaces/pods.repository.interface';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { PodMapper } from '../mappers/pod.mapper';
import { buildReplicaSetLabelSelector } from '../patches/deployment-rollback.patch';

@Injectable()
export class PodsRepository implements IPodsRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly podMapper: PodMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async listByDeployment(namespace: string, deploymentName: string): Promise<PodSummary[]> {
    const deployment = await this.k8sService.apps.readNamespacedDeployment({
      name: deploymentName,
      namespace,
    });
    const labelSelector = buildReplicaSetLabelSelector(deployment);

    const response = await this.k8sService.core.listNamespacedPod({
      namespace,
      labelSelector,
    });

    return (response.items ?? []).map((item) => this.podMapper.toSummary(item));
  }

  async listByNamespace(namespace: string): Promise<PodSummary[]> {
    const response = await this.k8sService.core.listNamespacedPod({ namespace });
    return (response.items ?? []).map((item) => this.podMapper.toSummary(item));
  }

  async isPodInDeployment(namespace: string, deploymentName: string, podName: string): Promise<boolean> {
    const pods = await this.listByDeployment(namespace, deploymentName);
    return pods.some((pod) => pod.name === podName);
  }

  async deletePod(namespace: string, name: string): Promise<void> {
    try {
      await this.k8sService.core.deleteNamespacedPod({ name, namespace });
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.POD_NOT_FOUND,
        resourceLabel: 'Pod',
        resourceName: name,
      });
    }
  }
}

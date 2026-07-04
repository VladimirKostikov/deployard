import { Injectable } from '@nestjs/common';
import { ApiErrorCode, DeploymentHealthInsight } from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { mapContainerProbes } from '../mappers/deployment-probe.mapper';
import { PodMapper } from '../mappers/pod.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { buildReplicaSetLabelSelector } from '../patches/deployment-rollback.patch';

@Injectable()
export class DeploymentsHealthRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly podMapper: PodMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async getHealthInsight(namespace: string, name: string): Promise<DeploymentHealthInsight> {
    try {
      const deployment = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });
      const container = deployment.spec?.template?.spec?.containers?.[0];

      if (!container) {
        throw this.exceptionMapper.toHttpException(new Error('Deployment has no containers'), {
          notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
          resourceLabel: 'Deployment',
          resourceName: name,
        });
      }

      const labelSelector = buildReplicaSetLabelSelector(deployment);
      const podsResponse = await this.k8sService.core.listNamespacedPod({
        namespace,
        labelSelector,
      });

      const pods = (podsResponse.items ?? []).map((item) => this.podMapper.toSummary(item));

      return {
        containerName: container.name ?? name,
        probes: mapContainerProbes(container),
        pods: pods.map((pod) => {
          const containerStatus = pod.containers.find((entry) => entry.name === container.name);
          const started = containerStatus?.state === 'running' || pod.phase === 'Running';

          return {
            podName: pod.name,
            containerName: container.name ?? name,
            ready: pod.ready,
            started,
            readinessPassed: containerStatus?.ready ?? false,
            phase: pod.phase,
          };
        }),
      };
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        resourceLabel: 'Deployment',
        resourceName: name,
      });
    }
  }
}

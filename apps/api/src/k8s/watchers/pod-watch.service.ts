import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { PodSummary } from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { PodMapper } from '../mappers/pod.mapper';
import { buildReplicaSetLabelSelector } from '../patches/deployment-rollback.patch';

export type PodWatchEvent = {
  type: string;
  pod: PodSummary;
};

@Injectable()
export class PodWatchService {
  constructor(
    private readonly k8sService: K8sService,
    private readonly podMapper: PodMapper,
  ) {}

  async watchDeploymentPods(
    namespace: string,
    deploymentName: string,
    cluster: string | undefined,
    onEvent: (event: PodWatchEvent) => void,
    onError: (error: Error) => void,
  ): Promise<() => void> {
    const clients = this.k8sService.runInCluster(cluster, () => ({
      apps: this.k8sService.apps,
      kubeConfig: this.k8sService.getKubeConfig(),
    }));

    const deployment = await clients.apps.readNamespacedDeployment({
      name: deploymentName,
      namespace,
    });
    const labelSelector = buildReplicaSetLabelSelector(deployment);
    const watchClient = new k8s.Watch(clients.kubeConfig);
    let aborted = false;

    const path = `/api/v1/namespaces/${namespace}/pods`;
    const requestPromise = watchClient.watch(
      path,
      { labelSelector },
      (type, object) => {
        onEvent({
          type,
          pod: this.podMapper.toSummary(object as k8s.V1Pod),
        });
      },
      (error) => {
        if (!aborted) {
          onError(error instanceof Error ? error : new Error('Pod watch failed'));
        }
      },
    );

    return () => {
      aborted = true;
      void requestPromise.then((request) => request.abort());
    };
  }
}

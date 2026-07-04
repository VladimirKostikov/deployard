import { Injectable } from '@nestjs/common';
import { ApiErrorCode, DeploymentRevision, DeploymentSummary } from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { DeploymentMapper } from '../mappers/deployment.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { buildReplicaSetLabelSelector } from '../patches/deployment-rollback.patch';

@Injectable()
export class DeploymentsReadRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly deploymentMapper: DeploymentMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async list(namespace: string): Promise<DeploymentSummary[]> {
    const response = await this.k8sService.apps.listNamespacedDeployment({ namespace });
    return (response.items ?? []).map((item) => this.deploymentMapper.toSummary(item));
  }

  async listAll(): Promise<DeploymentSummary[]> {
    const namespaces = await this.k8sService.core.listNamespace();
    const summaries: DeploymentSummary[] = [];

    for (const item of namespaces.items ?? []) {
      const namespace = item.metadata?.name;
      if (!namespace) {
        continue;
      }

      const response = await this.k8sService.apps.listNamespacedDeployment({ namespace });
      summaries.push(...(response.items ?? []).map((entry) => this.deploymentMapper.toSummary(entry)));
    }

    return summaries.sort((left, right) => {
      const namespaceOrder = left.namespace.localeCompare(right.namespace);
      if (namespaceOrder !== 0) {
        return namespaceOrder;
      }
      return left.name.localeCompare(right.name);
    });
  }

  async findByName(namespace: string, name: string): Promise<DeploymentSummary> {
    try {
      const deployment = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });
      return this.deploymentMapper.toSummary(deployment);
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        resourceLabel: 'Deployment',
        resourceName: name,
      });
    }
  }

  async listRevisions(namespace: string, name: string): Promise<DeploymentRevision[]> {
    const deployment = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });
    const labelSelector = buildReplicaSetLabelSelector(deployment);
    const response = await this.k8sService.apps.listNamespacedReplicaSet({
      namespace,
      labelSelector,
    });

    const deploymentRevision = Number(
      deployment.metadata?.annotations?.['deployment.kubernetes.io/revision'] ?? 0,
    );
    const deploymentChangeCause = deployment.metadata?.annotations?.['kubernetes.io/change-cause'];

    const sorted = this.deploymentMapper.sortRevisionsDesc(response.items ?? []);
    return sorted.map((item) => {
      const revision = this.deploymentMapper.toRevision(item);
      if (revision.revision === deploymentRevision && !revision.changeCause && deploymentChangeCause) {
        return { ...revision, changeCause: deploymentChangeCause };
      }
      return revision;
    });
  }
}

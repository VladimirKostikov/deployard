import { ApiErrorCode, DeploymentSummary } from '@dpd/shared';
import { HttpException, Injectable } from '@nestjs/common';
import { K8sService } from '../k8s.service';
import { DeploymentMapper } from '../mappers/deployment.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import {
  buildReplicaSetLabelSelector,
  createRolloutUndoPatch,
  findReplicaSetByRevision,
} from '../patches/deployment-rollback.patch';

@Injectable()
export class DeploymentsRollbackRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly deploymentMapper: DeploymentMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async rollback(namespace: string, name: string, revision: number): Promise<DeploymentSummary> {
    try {
      const deployment = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });
      const labelSelector = buildReplicaSetLabelSelector(deployment);
      const replicaSets = await this.k8sService.apps.listNamespacedReplicaSet({
        namespace,
        labelSelector,
      });

      const targetReplicaSet = findReplicaSetByRevision(replicaSets.items ?? [], revision);
      if (!targetReplicaSet) {
        throw this.exceptionMapper.toHttpException(
          { statusCode: 404 },
          {
            notFoundCode: ApiErrorCode.ROLLBACK_FAILED,
            fallbackCode: ApiErrorCode.ROLLBACK_FAILED,
            resourceLabel: 'Revision',
            resourceName: String(revision),
          },
        );
      }

      const patched = await this.k8sService.apps.patchNamespacedDeployment({
        name,
        namespace,
        body: createRolloutUndoPatch(targetReplicaSet, revision),
      });
      return this.deploymentMapper.toSummary(patched);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        fallbackCode: ApiErrorCode.ROLLBACK_FAILED,
        resourceLabel: 'Deployment',
        resourceName: name,
      });
    }
  }
}

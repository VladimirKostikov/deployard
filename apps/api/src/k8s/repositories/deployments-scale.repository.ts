import { Injectable } from '@nestjs/common';
import { ApiErrorCode, DeploymentSummary } from '@dpd/shared';
import { HttpException } from '@nestjs/common';
import { K8sService } from '../k8s.service';
import { DeploymentMapper } from '../mappers/deployment.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { createDeploymentClearDisablePatch } from '../patches/deployment-disable.patch';
import { createDeploymentReplicasPatch } from '../patches/deployment-image.patch';

@Injectable()
export class DeploymentsScaleRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly deploymentMapper: DeploymentMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async scale(namespace: string, name: string, replicas: number): Promise<DeploymentSummary> {
    try {
      const current = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });
      const patchBody =
        replicas > 0
          ? [
              ...createDeploymentReplicasPatch(replicas),
              ...createDeploymentClearDisablePatch(current),
            ]
          : createDeploymentReplicasPatch(replicas);

      const patched = await this.k8sService.apps.patchNamespacedDeployment({
        name,
        namespace,
        body: patchBody,
      });
      return this.deploymentMapper.toSummary(patched);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        resourceLabel: 'Deployment',
        resourceName: name,
      });
    }
  }
}

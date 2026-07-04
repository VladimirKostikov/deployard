import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { ApiErrorCode, DeploymentSummary } from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { DeploymentMapper } from '../mappers/deployment.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { createDeploymentRestartPatch } from '../patches/deployment-restart.patch';

@Injectable()
export class DeploymentsRestartRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly deploymentMapper: DeploymentMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async restart(namespace: string, name: string): Promise<DeploymentSummary> {
    try {
      const current = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });

      const patched = await this.k8sService.apps.patchNamespacedDeployment({
        name,
        namespace,
        body: createDeploymentRestartPatch(current),
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

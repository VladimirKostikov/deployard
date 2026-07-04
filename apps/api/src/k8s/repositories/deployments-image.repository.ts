import { Injectable } from '@nestjs/common';
import { ApiErrorCode, DeploymentSummary } from '@dpd/shared';
import { HttpException } from '@nestjs/common';
import { K8sService } from '../k8s.service';
import { DeploymentMapper } from '../mappers/deployment.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { createDeploymentImagePatch } from '../patches/deployment-image.patch';

@Injectable()
export class DeploymentsImageRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly deploymentMapper: DeploymentMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async updateImage(namespace: string, name: string, image: string): Promise<DeploymentSummary> {
    try {
      const current = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });

      const patched = await this.k8sService.apps.patchNamespacedDeployment({
        name,
        namespace,
        body: createDeploymentImagePatch(current, image),
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

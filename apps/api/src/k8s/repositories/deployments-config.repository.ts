import { Injectable } from '@nestjs/common';
import { ApiErrorCode, ContainerEnvVar, DeploymentConfigSummary } from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { createDeploymentEnvPatch } from '../patches/deployment-env.patch';
import {
  fromEnvVars,
  toDeploymentConfigSummary,
} from '../config/deployment-config.resolver';

@Injectable()
export class DeploymentsConfigRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async getConfig(namespace: string, name: string): Promise<DeploymentConfigSummary> {
    const deployment = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });
    return toDeploymentConfigSummary(deployment);
  }

  async updateConfig(
    namespace: string,
    name: string,
    env: ContainerEnvVar[],
  ): Promise<DeploymentConfigSummary> {
    try {
      const current = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });
      const patched = await this.k8sService.apps.patchNamespacedDeployment({
        name,
        namespace,
        body: createDeploymentEnvPatch(current, fromEnvVars(env)),
      });

      return toDeploymentConfigSummary(patched);
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        resourceLabel: 'Deployment',
        resourceName: name,
      });
    }
  }
}

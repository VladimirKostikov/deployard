import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import {
  ApiErrorCode,
  DeploymentSummary,
  readDeploymentDisableState,
} from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { DeploymentMapper } from '../mappers/deployment.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import {
  createDeploymentDisablePatch,
  createDeploymentEnablePatch,
} from '../patches/deployment-disable.patch';

@Injectable()
export class DeploymentsDisableRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly deploymentMapper: DeploymentMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async disable(namespace: string, name: string): Promise<DeploymentSummary> {
    try {
      const current = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });
      const replicas = current.spec?.replicas ?? 0;
      const { disabled, previousReplicas } = readDeploymentDisableState(
        current.metadata?.annotations,
      );

      if (disabled && replicas === 0) {
        return this.deploymentMapper.toSummary(current);
      }

      const storedReplicas = replicas > 0 ? replicas : previousReplicas ?? 1;
      const readyReplicas = current.status?.readyReplicas ?? 0;
      const hadErrors = replicas > 0 && readyReplicas < replicas;

      const patched = await this.k8sService.apps.patchNamespacedDeployment({
        name,
        namespace,
        body: createDeploymentDisablePatch(current, storedReplicas, hadErrors),
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

  async enable(namespace: string, name: string): Promise<DeploymentSummary> {
    try {
      const current = await this.k8sService.apps.readNamespacedDeployment({ name, namespace });
      const { disabled, previousReplicas } = readDeploymentDisableState(
        current.metadata?.annotations,
      );

      if (!disabled) {
        throw new BadRequestException('Deployment is not disabled');
      }

      const targetReplicas = previousReplicas ?? 1;

      const patched = await this.k8sService.apps.patchNamespacedDeployment({
        name,
        namespace,
        body: createDeploymentEnablePatch(current, targetReplicas),
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

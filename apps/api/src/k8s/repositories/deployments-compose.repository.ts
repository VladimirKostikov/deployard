import { ConflictException, Injectable } from '@nestjs/common';
import { ApiErrorCode, DeploymentSummary } from '@dpd/shared';
import { HttpException } from '@nestjs/common';
import { ComposeK8sServicePlan } from '../../compose/compose-plan.types';
import { buildComposeDeploymentBody } from '../builders/compose-deployment.builder';
import { K8sService } from '../k8s.service';
import { DeploymentMapper } from '../mappers/deployment.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';

@Injectable()
export class DeploymentsComposeRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly deploymentMapper: DeploymentMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async upsertFromPlan(
    namespace: string,
    plan: ComposeK8sServicePlan,
    projectName: string,
  ): Promise<{ summary: DeploymentSummary; action: 'created' | 'updated' }> {
    await this.assertProjectOwnership(namespace, plan.resourceName, projectName);

    const body = buildComposeDeploymentBody(namespace, plan, projectName);

    try {
      const created = await this.k8sService.apps.createNamespacedDeployment({
        namespace,
        body,
      });
      return { summary: this.deploymentMapper.toSummary(created), action: 'created' };
    } catch (error) {
      if (this.exceptionMapper.resolveStatusCode(error) !== 409) {
        if (error instanceof HttpException) {
          throw error;
        }

        throw this.exceptionMapper.toHttpException(error, {
          notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
          resourceLabel: 'Deployment',
          resourceName: plan.resourceName,
        });
      }
    }

    try {
      const updated = await this.k8sService.apps.replaceNamespacedDeployment({
        name: plan.resourceName,
        namespace,
        body,
      });
      return { summary: this.deploymentMapper.toSummary(updated), action: 'updated' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        resourceLabel: 'Deployment',
        resourceName: plan.resourceName,
      });
    }
  }

  private async assertProjectOwnership(
    namespace: string,
    resourceName: string,
    projectName: string,
  ): Promise<void> {
    try {
      const existing = await this.k8sService.apps.readNamespacedDeployment({
        name: resourceName,
        namespace,
      });
      const existingPartOf = existing.metadata?.labels?.['app.kubernetes.io/part-of']?.trim();

      if (existingPartOf && existingPartOf !== projectName.trim()) {
        throw new ConflictException(
          `Deployment "${resourceName}" already belongs to project group "${existingPartOf}"`,
        );
      }
    } catch (error) {
      if (this.exceptionMapper.resolveStatusCode(error) === 404) {
        return;
      }

      if (error instanceof ConflictException) {
        throw error;
      }

      throw error;
    }
  }
}

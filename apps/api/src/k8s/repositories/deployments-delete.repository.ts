import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { ApiErrorCode } from '@dpd/shared';
import { K8sService } from '../k8s.service';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { SecretsRepository } from './secrets.repository';

@Injectable()
export class DeploymentsDeleteRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly exceptionMapper: KubeExceptionMapper,
    private readonly secretsRepository: SecretsRepository,
  ) {}

  async delete(namespace: string, name: string): Promise<void> {
    try {
      await this.k8sService.apps.deleteNamespacedDeployment({ name, namespace });
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

    await this.secretsRepository.deleteIfExists(namespace, `${name}-env`);
    await this.secretsRepository.deleteIfExists(namespace, `${name}-secret`);
  }
}

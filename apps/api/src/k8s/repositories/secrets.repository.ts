import { Injectable } from '@nestjs/common';
import { ApiErrorCode } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';
import { K8sService } from '../k8s.service';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';

@Injectable()
export class SecretsRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async upsertOpaque(
    namespace: string,
    name: string,
    data: Record<string, string>,
  ): Promise<'created' | 'updated'> {
    const body: k8s.V1Secret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: { name, namespace },
      type: 'Opaque',
      stringData: data,
    };

    try {
      await this.k8sService.core.createNamespacedSecret({ namespace, body });
      return 'created';
    } catch (error) {
      if (this.exceptionMapper.resolveStatusCode(error) !== 409) {
        throw this.exceptionMapper.toHttpException(error, {
          notFoundCode: ApiErrorCode.K8S_API_ERROR,
          resourceLabel: 'Secret',
          resourceName: name,
        });
      }
    }

    try {
      await this.k8sService.core.replaceNamespacedSecret({
        name,
        namespace,
        body: {
          ...body,
          metadata: { name, namespace },
        },
      });
      return 'updated';
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.K8S_API_ERROR,
        resourceLabel: 'Secret',
        resourceName: name,
      });
    }
  }

  async deleteIfExists(namespace: string, name: string): Promise<void> {
    try {
      await this.k8sService.core.deleteNamespacedSecret({ name, namespace });
    } catch (error) {
      if (this.exceptionMapper.resolveStatusCode(error) === 404) {
        return;
      }

      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.K8S_API_ERROR,
        resourceLabel: 'Secret',
        resourceName: name,
      });
    }
  }
}

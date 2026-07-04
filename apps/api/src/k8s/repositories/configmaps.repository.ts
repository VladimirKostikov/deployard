import { Injectable } from '@nestjs/common';
import { ApiErrorCode } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';
import { K8sService } from '../k8s.service';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';

@Injectable()
export class ConfigMapsRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async upsert(
    namespace: string,
    name: string,
    data: Record<string, string>,
  ): Promise<'created' | 'updated'> {
    const body: k8s.V1ConfigMap = {
      apiVersion: 'v1',
      kind: 'ConfigMap',
      metadata: { name, namespace },
      data,
    };

    try {
      await this.k8sService.core.createNamespacedConfigMap({ namespace, body });
      return 'created';
    } catch (error) {
      if (this.exceptionMapper.resolveStatusCode(error) !== 409) {
        throw this.exceptionMapper.toHttpException(error, {
          notFoundCode: ApiErrorCode.K8S_API_ERROR,
          resourceLabel: 'ConfigMap',
          resourceName: name,
        });
      }
    }

    try {
      await this.k8sService.core.replaceNamespacedConfigMap({
        name,
        namespace,
        body,
      });
      return 'updated';
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.K8S_API_ERROR,
        resourceLabel: 'ConfigMap',
        resourceName: name,
      });
    }
  }

  async deleteIfExists(namespace: string, name: string): Promise<boolean> {
    try {
      await this.k8sService.core.deleteNamespacedConfigMap({ name, namespace });
      return true;
    } catch (error) {
      if (this.exceptionMapper.resolveStatusCode(error) === 404) {
        return false;
      }

      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.K8S_API_ERROR,
        resourceLabel: 'ConfigMap',
        resourceName: name,
      });
    }
  }
}

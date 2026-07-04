import { Injectable } from '@nestjs/common';
import { ApiErrorCode } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';
import { K8sService } from '../k8s.service';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';

@Injectable()
export class PersistentVolumeClaimsRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async create(
    namespace: string,
    name: string,
    storage = '1Gi',
  ): Promise<'created' | 'exists'> {
    const body: k8s.V1PersistentVolumeClaim = {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: { name, namespace },
      spec: {
        accessModes: ['ReadWriteOnce'],
        resources: {
          requests: {
            storage,
          },
        },
      },
    };

    try {
      await this.k8sService.core.createNamespacedPersistentVolumeClaim({
        namespace,
        body,
      });
      return 'created';
    } catch (error) {
      if (this.exceptionMapper.resolveStatusCode(error) === 409) {
        return 'exists';
      }

      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.K8S_API_ERROR,
        resourceLabel: 'PersistentVolumeClaim',
        resourceName: name,
      });
    }
  }
}

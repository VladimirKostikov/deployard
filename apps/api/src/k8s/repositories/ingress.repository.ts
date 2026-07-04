import { Injectable } from '@nestjs/common';
import { ApiErrorCode, IngressSummary } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';
import { K8sService } from '../k8s.service';
import { IIngressRepository } from '../interfaces/ingress.repository.interface';
import { IngressMapper } from '../mappers/ingress.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';

@Injectable()
export class IngressRepository implements IIngressRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly ingressMapper: IngressMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async list(namespace: string): Promise<IngressSummary[]> {
    const response = await this.k8sService.networking.listNamespacedIngress({ namespace });
    return (response.items ?? []).map((item) => this.ingressMapper.toSummary(item));
  }

  async create(
    namespace: string,
    name: string,
    host: string,
    path: string,
    serviceName: string,
    servicePort: number,
  ): Promise<IngressSummary> {
    const body: k8s.V1Ingress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: { name, namespace },
      spec: {
        rules: [
          {
            host,
            http: {
              paths: [
                {
                  path,
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: serviceName,
                      port: { number: servicePort },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    };

    try {
      const created = await this.k8sService.networking.createNamespacedIngress({ namespace, body });
      return this.ingressMapper.toSummary(created);
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.INGRESS_NOT_FOUND,
        resourceLabel: 'Ingress',
        resourceName: name,
      });
    }
  }

  async delete(namespace: string, name: string): Promise<void> {
    try {
      await this.k8sService.networking.deleteNamespacedIngress({ name, namespace });
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.INGRESS_NOT_FOUND,
        resourceLabel: 'Ingress',
        resourceName: name,
      });
    }
  }
}

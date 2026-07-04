import { Injectable } from '@nestjs/common';
import { ApiErrorCode, ServiceSummary } from '@dpd/shared';
import * as k8s from '@kubernetes/client-node';
import { K8sService } from '../k8s.service';
import { ServiceMapper } from '../mappers/service.mapper';
import { KubeExceptionMapper } from '../mappers/kube-exception.mapper';
import { labelsMatchSelector } from '../utils/label-selector-match';

@Injectable()
export class ServicesRepository {
  constructor(
    private readonly k8sService: K8sService,
    private readonly serviceMapper: ServiceMapper,
    private readonly exceptionMapper: KubeExceptionMapper,
  ) {}

  async list(namespace: string): Promise<ServiceSummary[]> {
    const response = await this.k8sService.core.listNamespacedService({ namespace });
    return (response.items ?? []).map((item) => this.serviceMapper.toSummary(item));
  }

  async listForDeployment(namespace: string, deploymentName: string): Promise<ServiceSummary[]> {
    const deployment = await this.k8sService.apps.readNamespacedDeployment({
      name: deploymentName,
      namespace,
    });
    const podLabels = deployment.spec?.template?.metadata?.labels ?? {};
    const services = await this.list(namespace);

    return services.filter((service) => labelsMatchSelector(podLabels, service.selector));
  }

  async createForDeployment(
    namespace: string,
    name: string,
    deploymentName: string,
    port: number,
    targetPort?: number,
  ): Promise<ServiceSummary> {
    const deployment = await this.k8sService.apps.readNamespacedDeployment({
      name: deploymentName,
      namespace,
    });
    const selector = deployment.spec?.selector?.matchLabels;

    if (!selector || Object.keys(selector).length === 0) {
      throw this.exceptionMapper.toHttpException(new Error('Deployment has no selector labels'), {
        notFoundCode: ApiErrorCode.DEPLOYMENT_NOT_FOUND,
        resourceLabel: 'Deployment',
        resourceName: deploymentName,
      });
    }

    const resolvedTargetPort = targetPort ?? port;
    const body: k8s.V1Service = {
      apiVersion: 'v1',
      kind: 'Service',
      metadata: { name, namespace },
      spec: {
        type: 'ClusterIP',
        selector,
        ports: [
          {
            name: 'http',
            port,
            targetPort: resolvedTargetPort,
            protocol: 'TCP',
          },
        ],
      },
    };

    try {
      const created = await this.k8sService.core.createNamespacedService({ namespace, body });
      return this.serviceMapper.toSummary(created);
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.SERVICE_NOT_FOUND,
        resourceLabel: 'Service',
        resourceName: name,
      });
    }
  }

  async delete(namespace: string, name: string): Promise<void> {
    try {
      await this.k8sService.core.deleteNamespacedService({ name, namespace });
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.SERVICE_NOT_FOUND,
        resourceLabel: 'Service',
        resourceName: name,
      });
    }
  }

  async deleteIfExists(namespace: string, name: string): Promise<boolean> {
    try {
      await this.k8sService.core.deleteNamespacedService({ name, namespace });
      return true;
    } catch (error) {
      if (this.exceptionMapper.resolveStatusCode(error) === 404) {
        return false;
      }

      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.SERVICE_NOT_FOUND,
        resourceLabel: 'Service',
        resourceName: name,
      });
    }
  }

  async update(
    namespace: string,
    name: string,
    payload: {
      type?: string;
      ports?: Array<{
        name?: string;
        port: number;
        targetPort: number;
        nodePort?: number;
        protocol?: string;
      }>;
    },
  ): Promise<ServiceSummary> {
    try {
      const patched = await this.k8sService.core.patchNamespacedService({
        name,
        namespace,
        body: {
          spec: {
            type: payload.type,
            ports: payload.ports?.map((port) => ({
              name: port.name ?? `port-${port.port}`,
              port: port.port,
              targetPort: port.targetPort,
              nodePort: port.nodePort,
              protocol: port.protocol ?? 'TCP',
            })),
          },
        },
      });
      return this.serviceMapper.toSummary(patched);
    } catch (error) {
      throw this.exceptionMapper.toHttpException(error, {
        notFoundCode: ApiErrorCode.SERVICE_NOT_FOUND,
        fallbackCode: ApiErrorCode.K8S_API_ERROR,
        resourceLabel: 'Service',
        resourceName: name,
      });
    }
  }
}
